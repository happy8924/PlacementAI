import logging
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Header
from pymongo.database import Database as MongoDatabase
from bson import ObjectId

from app.core.database import get_db
from app.core.security import decode_access_token
from app.services.eligibility import evaluate_student_job_eligibility
from pydantic import BaseModel, Field

class JobCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    company_name: str = Field(..., min_length=2, max_length=150)
    location: str
    job_type: str = Field("Full-time", description="Full-time, Part-time, Internship")
    description: str
    requirements: List[str] = []
    min_cgpa: float = Field(0.0, ge=0.0, le=10.0)
    eligible_branches: List[str] = []
    salary_package: str
    deadline: datetime
    status: str = Field("open", description="open or closed")

logger = logging.getLogger(__name__)

router = APIRouter()

def get_current_user(authorization: Optional[str] = Header(None), db: MongoDatabase = Depends(get_db)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required"
        )
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    user_id = payload["sub"]
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = db.users.find_one({"_id": user_id})
        
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if not user.get("is_approved", True) or user.get("approval_status") == "pending":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account pending TPO approval."
        )

    if user.get("is_active") is False:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account deactivated."
        )

    return user

def seed_default_jobs_if_empty(db: MongoDatabase):
    """Seed initial recruiter job postings if collection is empty."""
    if db.jobs.count_documents({}) == 0:
        logger.info("Seeding initial recruiter job postings into MongoDB...")
        initial_jobs = [
            {
                "title": "Senior Full Stack & AI Systems Architect",
                "company_name": "NexusAI Cloud Systems",
                "location": "Bengaluru / Remote",
                "job_type": "Full-time",
                "description": "Looking for passionate Full Stack and AI engineers proficient in React, FastAPI, Node.js, and LLM orchestration.",
                "requirements": ["React", "Node.js", "Python", "FastAPI", "LLM", "Docker"],
                "min_cgpa": 6.5,
                "eligible_branches": ["Computer Science", "Information Technology", "AI & Data Science", "MCA", "B.Tech CS"],
                "salary_package": "18 - 24 LPA",
                "deadline": datetime(2026, 12, 31, tzinfo=timezone.utc),
                "status": "open",
                "created_by": "recruiter_system",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "title": "Backend Microservices Specialist",
                "company_name": "FinTech Cloud Solutions",
                "location": "Hyderabad",
                "job_type": "Full-time",
                "description": "Build high-throughput backend services and scalable database pipelines.",
                "requirements": ["Python", "PostgreSQL", "Redis", "Kafka", "Docker"],
                "min_cgpa": 6.0,
                "eligible_branches": ["Computer Science", "IT", "MCA", "ECE", "BCA", "M.Tech"],
                "salary_package": "14 - 18 LPA",
                "deadline": datetime(2026, 12, 31, tzinfo=timezone.utc),
                "status": "open",
                "created_by": "recruiter_system",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        ]
        db.jobs.insert_many(initial_jobs)

@router.get("", response_model=List[dict])
@router.get("/", response_model=List[dict])
def get_all_jobs(
    authorization: Optional[str] = Header(None),
    db: MongoDatabase = Depends(get_db)
):
    """
    List open job postings.
    If requested by an authenticated student, filters or annotates jobs strictly
    based on whether the student meets CGPA, Branch, and Technical Skill criteria.
    """
    seed_default_jobs_if_empty(db)

    # Check if request has student auth token
    current_student = None
    student_profile = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if payload and payload.get("sub"):
            user_id = payload["sub"]
            try:
                user = db.users.find_one({"_id": ObjectId(user_id)})
            except Exception:
                user = db.users.find_one({"_id": user_id})

            if user and user.get("role") == "student":
                current_student = user
                student_profile = db.student_profiles.find_one({"user_id": str(user["_id"])}) or {}

    cursor = db.jobs.find({"status": "open"}).sort("created_at", -1)
    jobs = []

    for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]

        if current_student:
            is_eligible, reasons, metrics = evaluate_student_job_eligibility(
                current_student,
                student_profile,
                doc
            )
            # Only include jobs where student is strictly eligible
            if not is_eligible:
                continue

            doc["is_eligible"] = True
            doc["eligibility_metrics"] = metrics
        else:
            doc["is_eligible"] = True

        jobs.append(doc)

    return jobs

@router.get("/{job_id}", response_model=dict)
def get_job(job_id: str, db: MongoDatabase = Depends(get_db)):
    """Get a specific job posting by ID."""
    from bson import ObjectId
    try:
        obj_id = ObjectId(job_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid job ID format")
    
    job = db.jobs.find_one({"_id": obj_id})
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
        
    job["id"] = str(job["_id"])
    del job["_id"]
    
    return {"success": True, "job": job}

@router.post("", response_model=dict)
@router.post("/", response_model=dict)
def create_job(
    job_data: JobCreate,
    current_user: dict = Depends(get_current_user),
    db: MongoDatabase = Depends(get_db)
):
    """Post a new job vacancy as recruiter or admin."""
    job_dict = job_data.model_dump()
    job_dict["created_by"] = str(current_user["_id"])
    job_dict["created_at"] = datetime.now(timezone.utc)
    job_dict["updated_at"] = datetime.now(timezone.utc)

    result = db.jobs.insert_one(job_dict)
    job_dict["id"] = str(result.inserted_id)
    if "_id" in job_dict:
        del job_dict["_id"]

    return {
        "success": True,
        "message": "Job vacancy created successfully!",
        "job": job_dict
    }
