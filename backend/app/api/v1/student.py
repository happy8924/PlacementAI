import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel, Field
from pymongo.database import Database as MongoDatabase

from app.core.database import get_db
from app.core.security import decode_access_token

logger = logging.getLogger(__name__)

router = APIRouter()

# ── Dependencies ──

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
    from bson import ObjectId
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = db.users.find_one({"_id": user_id})
        
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

# ── Pydantic Request/Response Models ──

class SocialLinksInput(BaseModel):
    github: Optional[str] = None
    linkedin: Optional[str] = None

class StudentProfileUpdateInput(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    cgpa: Optional[float] = None
    skills: List[str] = []
    links: Optional[SocialLinksInput] = None

# ── Helper function for profile completion calculation ──

def calculate_profile_completion(profile: dict, user_name: str = "") -> tuple[float, bool]:
    full_name = profile.get("full_name") or user_name
    branch = profile.get("branch")
    grad_year = profile.get("graduation_year")
    cgpa = profile.get("cgpa")
    skills = profile.get("skills") or []
    links = profile.get("links") or {}
    
    has_github = bool(links.get("github") if isinstance(links, dict) else getattr(links, "github", None))
    has_linkedin = bool(links.get("linkedin") if isinstance(links, dict) else getattr(links, "linkedin", None))

    score = 0
    if full_name and len(full_name.strip()) >= 2:
        score += 15
    if branch and len(branch.strip()) >= 2:
        score += 15
    if grad_year and grad_year >= 2000:
        score += 15
    if cgpa is not None and 0.0 <= float(cgpa) <= 10.0:
        score += 15
    if skills and len(skills) > 0:
        score += 20
    if has_github or has_linkedin:
        score += 20

    is_complete = (
        bool(full_name and len(full_name.strip()) >= 2) and
        bool(branch and len(branch.strip()) >= 2) and
        bool(grad_year and grad_year >= 2000) and
        bool(cgpa is not None and float(cgpa) > 0.0) and
        bool(skills and len(skills) > 0) and
        bool(has_github or has_linkedin)
    )

    return float(score), is_complete

# ── API Endpoints ──

@router.get("/profile")
def get_student_profile(current_user: dict = Depends(get_current_user), db: MongoDatabase = Depends(get_db)):
    user_id_str = str(current_user["_id"])
    
    # Try finding existing profile
    profile = db.student_profiles.find_one({"user_id": user_id_str})
    
    if not profile:
        # Pre-fill from registered user details if available
        student_details = current_user.get("student_details") or {}
        profile = {
            "user_id": user_id_str,
            "full_name": current_user.get("name", ""),
            "phone": "",
            "college": "",
            "degree": "",
            "branch": student_details.get("branch", ""),
            "graduation_year": student_details.get("graduation_year"),
            "cgpa": None,
            "skills": [],
            "links": {"github": "", "linkedin": ""},
            "resume_id": None,
            "placement_status": "unplaced",
            "interview_readiness_score": 0.0,
            "profile_completion": 0.0,
            "profile_completed": False,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
    
    completion_pct, is_complete = calculate_profile_completion(profile, current_user.get("name", ""))
    profile["profile_completion"] = completion_pct
    profile["profile_completed"] = is_complete

    # Format ID
    if "_id" in profile:
        profile["id"] = str(profile["_id"])
        del profile["_id"]

    return {
        "success": True,
        "profile": profile
    }

@router.put("/profile")
def update_student_profile(
    data: StudentProfileUpdateInput,
    current_user: dict = Depends(get_current_user),
    db: MongoDatabase = Depends(get_db)
):
    user_id_str = str(current_user["_id"])

    # Prepare update document
    links_dict = data.links.model_dump() if data.links else {"github": "", "linkedin": ""}
    
    update_fields = {
        "user_id": user_id_str,
        "full_name": data.full_name or current_user.get("name", ""),
        "phone": data.phone or "",
        "college": data.college or "",
        "degree": data.degree or "",
        "branch": data.branch or "",
        "graduation_year": data.graduation_year,
        "cgpa": data.cgpa,
        "skills": [s.strip() for s in data.skills if s.strip()],
        "links": links_dict,
        "updated_at": datetime.now(timezone.utc)
    }

    completion_pct, is_complete = calculate_profile_completion(update_fields, current_user.get("name", ""))
    update_fields["profile_completion"] = completion_pct
    update_fields["profile_completed"] = is_complete

    # Upsert into student_profiles
    db.student_profiles.update_one(
        {"user_id": user_id_str},
        {"$set": update_fields, "$setOnInsert": {"created_at": datetime.now(timezone.utc), "placement_status": "unplaced"}},
        upsert=True
    )

    # Sync full_name back to user object if updated
    if data.full_name:
        db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": {"name": data.full_name, "updated_at": datetime.now(timezone.utc)}}
        )

    # Return updated profile
    saved_profile = db.student_profiles.find_one({"user_id": user_id_str})
    if saved_profile and "_id" in saved_profile:
        saved_profile["id"] = str(saved_profile["_id"])
        del saved_profile["_id"]

    return {
        "success": True,
        "message": "Profile updated successfully.",
        "profile": saved_profile
    }

@router.get("/dashboard")
def get_student_dashboard(current_user: dict = Depends(get_current_user), db: MongoDatabase = Depends(get_db)):
    user_id_str = str(current_user["_id"])

    profile = db.student_profiles.find_one({"user_id": user_id_str}) or {}
    completion_pct, is_complete = calculate_profile_completion(profile, current_user.get("name", ""))

    active_resume = db.resumes.find_one({"user_id": user_id_str, "is_active": True})
    applications_count = db.applications.count_documents({"student_id": user_id_str})

    # Recent activities
    logs_cursor = db.activity_logs.find({"user_id": user_id_str}).sort("timestamp", -1).limit(5)
    recent_activities = []
    for log in logs_cursor:
        recent_activities.append({
            "id": str(log["_id"]),
            "action": log.get("action", ""),
            "details": log.get("details", {}),
            "timestamp": log.get("timestamp") or log.get("created_at")
        })

    return {
        "success": True,
        "user": {
            "name": current_user.get("name", "Student"),
            "email": current_user.get("email", ""),
            "role": current_user.get("role", "student")
        },
        "profile_completion": {
            "percentage": completion_pct,
            "is_complete": is_complete
        },
        "resume_status": {
            "has_resume": bool(active_resume),
            "file_name": active_resume.get("file_name") if active_resume else None,
            "ats_score": active_resume.get("ats_score") if active_resume else None
        },
        "interview_readiness_score": profile.get("interview_readiness_score"),
        "stats": {
            "applications_count": applications_count,
            "ats_score": active_resume.get("ats_score") if active_resume else None
        },
        "recent_activities": recent_activities
    }
