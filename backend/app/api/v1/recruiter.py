import logging
import re
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Header, Query
from pydantic import BaseModel, Field, EmailStr, HttpUrl, validator, field_validator
from pymongo.database import Database as MongoDatabase
from bson import ObjectId

from app.core.database import get_db
from app.core.security import decode_access_token
from app.services.email import send_job_opportunity_email
from app.services.eligibility import evaluate_student_job_eligibility

logger = logging.getLogger(__name__)

router = APIRouter()

# ── Regex Constants for Validation ──
EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
PHONE_REGEX = r"^\+?[0-9]{7,15}$"
URL_REGEX = r"^https?://[^\s/$.?#].[^\s]*$"

# ── Role Verification Helper ──

def get_current_recruiter(authorization: Optional[str] = Header(None), db: MongoDatabase = Depends(get_db)) -> dict:
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    if user.get("role") != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Recruiter role required."
        )

    if not user.get("is_approved", True) or user.get("approval_status") == "pending":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recruiter account pending TPO approval."
        )

    if user.get("is_active") is False:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recruiter account deactivated."
        )

    return user

def log_recruiter_activity(db: MongoDatabase, user_id: str, action: str, details: dict):
    try:
        db.activity_logs.insert_one({
            "user_id": user_id,
            "role": "recruiter",
            "action": action,
            "details": details,
            "timestamp": datetime.now(timezone.utc)
        })
    except Exception as e:
        logger.error(f"Failed to log recruiter activity: {e}")

# ── Input Pydantic Schemas with Backend Validation ──

class RecruiterProfileUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=2, max_length=150)
    logo: Optional[str] = None
    about: Optional[str] = Field(None, max_length=2000)
    website: Optional[str] = None
    corporate_registration_id: Optional[str] = Field(None, max_length=100)
    industry: Optional[str] = Field(None, max_length=100)
    company_size: Optional[str] = Field(None, max_length=50)
    tier: Optional[str] = Field(None, max_length=50)
    headquarters: Optional[str] = Field(None, max_length=150)
    branches: Optional[List[str]] = []
    locations: Optional[List[str]] = []
    job_modes: Optional[List[str]] = []

    @field_validator("website", "logo", mode="before")
    @classmethod
    def validate_urls(cls, v):
        if v and v.strip():
            if not re.match(URL_REGEX, v.strip(), re.IGNORECASE):
                raise ValueError("Invalid URL format. Must start with http:// or https://")
            return v.strip()
        return None

class RecruiterJobCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    role: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    recruiter_name: Optional[str] = Field(None, max_length=100)
    official_email: Optional[str] = None
    phone: Optional[str] = None
    designation: Optional[str] = Field(None, max_length=100)
    company_name: Optional[str] = Field(None, max_length=150)
    company_website: Optional[str] = None
    company_careers_url: Optional[str] = None
    company_linkedin: Optional[str] = None
    company_description: Optional[str] = None
    employment_type: str = Field("Full-time", description="Full-time, Part-time, Internship")
    number_of_openings: int = Field(1, ge=1, description="Must be at least 1 opening")
    location: str = Field(..., min_length=2, max_length=150)
    work_mode: str = Field("On-site", description="On-site, Remote, Hybrid")
    salary_package: str = Field(..., min_length=1, max_length=100)
    experience_required: Optional[str] = "0-2 Years"
    min_cgpa: float = Field(0.0, ge=0.0, le=10.0, description="CGPA range 0.0 to 10.0")
    eligible_branches: List[str] = Field(..., min_items=1, description="At least one eligible branch required")
    requirements: List[str] = Field(..., min_items=1, description="At least one required skill required")
    preferred_skills: Optional[List[str]] = []
    description: str = Field(..., min_length=10, max_length=5000)
    responsibilities: Optional[str] = None
    selection_process: Optional[str] = None
    deadline: Optional[datetime] = None
    joining_date: Optional[str] = None
    apply_link: Optional[str] = None
    hr_contact_email: Optional[str] = None
    status: str = Field("pending_approval", description="draft, pending_approval, open, closed")

    @field_validator("official_email", "hr_contact_email", mode="before")
    @classmethod
    def validate_emails(cls, v):
        if v and v.strip():
            if not re.match(EMAIL_REGEX, v.strip()):
                raise ValueError("Invalid email format.")
            return v.strip().lower()
        return None

    @field_validator("phone", mode="before")
    @classmethod
    def validate_phone(cls, v):
        if v and v.strip():
            clean_phone = re.sub(r"[\s\-\(\)]", "", v.strip())
            if not re.match(PHONE_REGEX, clean_phone):
                raise ValueError("Invalid phone number format. Must contain 7 to 15 digits.")
            return clean_phone
        return None

    @field_validator("company_website", "company_careers_url", "company_linkedin", "apply_link", mode="before")
    @classmethod
    def validate_job_urls(cls, v):
        if v and v.strip():
            if not re.match(URL_REGEX, v.strip(), re.IGNORECASE):
                raise ValueError("Invalid URL format. Must start with http:// or https://")
            return v.strip()
        return None

    @field_validator("eligible_branches", "requirements", mode="before")
    @classmethod
    def filter_empty_list_strings(cls, v):
        if isinstance(v, list):
            clean = [item.strip() for item in v if isinstance(item, str) and item.strip()]
            if not clean:
                raise ValueError("List cannot be empty or contain only whitespace.")
            return clean
        return v

class ApplicationStatusUpdate(BaseModel):
    status: str = Field(..., description="shortlisted, rejected, interview_scheduled, offered, selected")
    notes: Optional[str] = None

class InterviewCreate(BaseModel):
    application_id: str
    student_id: str
    job_id: str
    round: str = Field("Technical Round 1", description="Round title/type")
    date: str = Field(..., description="YYYY-MM-DD")
    time: str = Field(..., description="HH:MM AM/PM")
    mode: str = Field("Online", description="Online, In-Person, Hybrid")
    meeting_link: Optional[str] = ""
    physical_location: Optional[str] = ""
    notes: Optional[str] = ""

class InterviewStatusUpdate(BaseModel):
    status: str = Field(..., description="Scheduled, Completed, Cancelled, Rescheduled")
    date: Optional[str] = None
    time: Optional[str] = None
    notes: Optional[str] = None

# ── 1. Recruiter Profile Routes ──

@router.get("/profile")
def get_recruiter_profile(current_user: dict = Depends(get_current_recruiter), db: MongoDatabase = Depends(get_db)):
    user_id_str = str(current_user["_id"])
    profile = db.recruiter_profiles.find_one({"user_id": user_id_str})
    
    if not profile:
        profile = {
            "user_id": user_id_str,
            "company_name": current_user.get("name", "") or "Company Name",
            "logo": "",
            "about": "",
            "website": "",
            "corporate_registration_id": "",
            "industry": "Software / IT Services",
            "company_size": "50-200",
            "tier": "Tier 1 Corporate",
            "headquarters": "",
            "branches": [],
            "locations": [],
            "job_modes": ["Full-time", "Internship"],
            "verification_status": "pending", # CRITICAL: Default to pending approval per planning
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        db.recruiter_profiles.insert_one(profile)

    profile["id"] = str(profile["_id"])
    del profile["_id"]
    return {"success": True, "profile": profile}

@router.put("/profile")
def update_recruiter_profile(
    data: RecruiterProfileUpdate,
    current_user: dict = Depends(get_current_recruiter),
    db: MongoDatabase = Depends(get_db)
):
    user_id_str = str(current_user["_id"])
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    # Recruiter MUST NOT alter TPO/Admin-controlled verification status!
    update_data.pop("verification_status", None)

    db.recruiter_profiles.update_one(
        {"user_id": user_id_str},
        {"$set": update_data},
        upsert=True
    )
    
    log_recruiter_activity(db, user_id_str, "RECRUITER_PROFILE_UPDATED", {"updated_fields": list(update_data.keys())})

    saved_profile = db.recruiter_profiles.find_one({"user_id": user_id_str})
    saved_profile["id"] = str(saved_profile["_id"])
    del saved_profile["_id"]

    return {"success": True, "message": "Company profile updated successfully.", "profile": saved_profile}

# ── 2. Candidate Recommendation Feed Route ──

@router.get("/recommendations")
def get_candidate_recommendations(
    job_id: Optional[str] = Query(None),
    limit: int = Query(6, ge=1, le=20),
    current_user: dict = Depends(get_current_recruiter),
    db: MongoDatabase = Depends(get_db)
):
    user_id_str = str(current_user["_id"])
    recruiter_jobs = list(db.jobs.find({"recruiter_id": user_id_str}))
    
    target_job = None
    if job_id:
        try:
            target_job = next((j for j in recruiter_jobs if str(j["_id"]) == job_id), None)
        except Exception:
            pass
    if not target_job and recruiter_jobs:
        target_job = recruiter_jobs[0]

    req_skills = [s.strip().lower() for s in (target_job.get("requirements") or target_job.get("required_skills") or [])] if target_job else []
    min_cgpa = float(target_job.get("min_cgpa", 0.0)) if target_job else 0.0

    students_cursor = db.users.find({"role": "student"})
    recommendations = []

    for st in students_cursor:
        st_id_str = str(st["_id"])
        st_prof = db.student_profiles.find_one({"user_id": st_id_str}) or {}
        st_resume = db.resumes.find_one({"user_id": st_id_str, "is_active": True}) or db.resumes.find_one({"user_id": st_id_str}) or {}

        cgpa = float(st_prof.get("cgpa", 0.0) or 0.0)
        skills = st_prof.get("skills") or st_resume.get("parsed_skills") or []
        branch = st_prof.get("branch") or "General"

        # Calculate Resume Match Score & IRS (Interview Readiness Score)
        ats_score = int(st_resume.get("ats_score", 75))
        
        matched_skills = 0
        st_skills_low = [sk.lower() for sk in skills]
        for r_skill in req_skills:
            pattern = r'\b' + re.escape(r_skill) + r'\b'
            if any(re.search(pattern, sk) for sk in st_skills_low):
                matched_skills += 1

        skill_match_pct = int((matched_skills / len(req_skills)) * 100) if req_skills else 80
        resume_match_score = min(98, max(50, int(0.6 * ats_score + 0.4 * skill_match_pct)))
        
        # IRS Calculation: weighted combination of CGPA, profile completion, & ATS score
        irs_score = min(99, max(45, int((cgpa / 10.0) * 35 + (st_prof.get("profile_completion", 80) / 100.0) * 25 + (ats_score / 100.0) * 40)))

        recommendations.append({
            "student_id": st_id_str,
            "student_name": st_prof.get("full_name") or st.get("name") or "Candidate",
            "student_email": st.get("email"),
            "cgpa": cgpa,
            "branch": branch,
            "skills": skills[:5],
            "irs_score": irs_score,
            "resume_match_score": resume_match_score,
            "ats_score": ats_score,
            "resume_url": st_resume.get("file_url") or "",
            "target_job_id": str(target_job["_id"]) if target_job else None,
            "target_job_title": target_job.get("title") if target_job else "Open Roles"
        })

    recommendations.sort(key=lambda x: (x["resume_match_score"], x["irs_score"]), reverse=True)
    return {"success": True, "recommendations": recommendations[:limit]}

# ── 3. Dashboard Analytics Route ──

@router.get("/dashboard")
def get_recruiter_dashboard(current_user: dict = Depends(get_current_recruiter), db: MongoDatabase = Depends(get_db)):
    user_id_str = str(current_user["_id"])
    
    recruiter_jobs = list(db.jobs.find({"recruiter_id": user_id_str}))
    job_ids = [str(j["_id"]) for j in recruiter_jobs]
    job_obj_ids = [j["_id"] for j in recruiter_jobs]
    
    all_job_id_query = {"$in": job_ids + job_obj_ids}

    active_jobs = len([j for j in recruiter_jobs if j.get("status") in ["open", "approved", "active"]])
    
    total_applicants = db.applications.count_documents({"job_id": all_job_id_query})
    shortlisted = db.applications.count_documents({"job_id": all_job_id_query, "status": "shortlisted"})
    offered = db.applications.count_documents({"job_id": all_job_id_query, "status": "offered"})
    selected = db.applications.count_documents({"job_id": all_job_id_query, "status": "selected"})
    
    interviews_scheduled = db.recruiter_interviews.count_documents({
        "recruiter_id": user_id_str,
        "status": "Scheduled"
    })

    recent_apps_cursor = db.applications.find({"job_id": all_job_id_query}).sort("applied_at", -1).limit(5)
    recent_applicants = []
    
    for app in recent_apps_cursor:
        student_id = app.get("student_id")
        student_user = None
        if student_id:
            try:
                student_user = db.users.find_one({"_id": ObjectId(student_id)})
            except Exception:
                student_user = db.users.find_one({"_id": student_id})

        student_prof = db.student_profiles.find_one({"user_id": str(student_id)}) or {} if student_id else {}
        job = next((j for j in recruiter_jobs if str(j["_id"]) == str(app.get("job_id"))), {})

        recent_applicants.append({
            "id": str(app["_id"]),
            "student_name": student_prof.get("full_name") or (student_user.get("name") if student_user else "Candidate"),
            "student_email": student_user.get("email") if student_user else "N/A",
            "job_title": job.get("title") or job.get("job_title") or "Position",
            "applied_at": app.get("applied_at").strftime("%Y-%m-%d %H:%M") if app.get("applied_at") else "Recently",
            "status": app.get("status", "applied"),
            "branch": student_prof.get("branch", "N/A"),
            "cgpa": student_prof.get("cgpa", "N/A")
        })

    recent_logs_cursor = db.activity_logs.find({"user_id": user_id_str}).sort("timestamp", -1).limit(5)
    recent_activity = []
    for l in recent_logs_cursor:
        recent_activity.append({
            "action": l.get("action"),
            "details": l.get("details"),
            "timestamp": l.get("timestamp").strftime("%b %d, %H:%M") if l.get("timestamp") else ""
        })

    return {
        "success": True,
        "stats": {
            "active_jobs": active_jobs,
            "total_jobs": len(recruiter_jobs),
            "total_applicants": total_applicants,
            "shortlisted": shortlisted,
            "interviews_scheduled": interviews_scheduled,
            "offered": offered,
            "selected": selected
        },
        "pipeline": {
            "applied": total_applicants,
            "shortlisted": shortlisted,
            "interviewed": interviews_scheduled,
            "offered": offered,
            "selected": selected
        },
        "recent_applicants": recent_applicants,
        "recent_activity": recent_activity
    }

# ── 4. Job Management Routes ──

@router.get("/jobs")
def get_recruiter_jobs(current_user: dict = Depends(get_current_recruiter), db: MongoDatabase = Depends(get_db)):
    user_id_str = str(current_user["_id"])
    jobs_cursor = db.jobs.find({"recruiter_id": user_id_str}).sort("created_at", -1)
    
    result = []
    for j in jobs_cursor:
        job_id_str = str(j["_id"])
        applicant_count = db.applications.count_documents({
            "$or": [{"job_id": job_id_str}, {"job_id": j["_id"]}]
        })
        j["id"] = job_id_str
        del j["_id"]
        j["applicant_count"] = applicant_count
        result.append(j)
        
    return {"success": True, "jobs": result}

@router.post("/jobs")
def create_recruiter_job(
    data: RecruiterJobCreate,
    current_user: dict = Depends(get_current_recruiter),
    db: MongoDatabase = Depends(get_db)
):
    user_id_str = str(current_user["_id"])
    rec_profile = db.recruiter_profiles.find_one({"user_id": user_id_str}) or {}

    job_dict = data.model_dump()
    job_dict["recruiter_id"] = user_id_str
    job_dict["company_name"] = data.company_name or rec_profile.get("company_name") or current_user.get("name") or "Company"
    job_dict["official_email"] = data.official_email or current_user.get("email")
    job_dict["recruiter_name"] = data.recruiter_name or current_user.get("name")
    
    job_dict["required_skills"] = data.requirements
    job_dict["created_at"] = datetime.now(timezone.utc)
    job_dict["updated_at"] = datetime.now(timezone.utc)

    # CRITICAL TPO APPROVAL CHECK: If recruiter/company is verified, open job immediately; otherwise set pending_approval!
    if rec_profile.get("verification_status") == "verified":
        job_dict["status"] = data.status if data.status in ["open", "approved", "closed"] else "open"
    else:
        job_dict["status"] = "pending_approval"

    res = db.jobs.insert_one(job_dict)
    job_id_str = str(res.inserted_id)

    log_recruiter_activity(db, user_id_str, "JOB_CREATED", {"job_id": job_id_str, "title": data.title, "status": job_dict["status"]})

    # Trigger job email broadcast ONLY IF job is approved/open!
    broadcast_stats = None
    if job_dict["status"] in ["open", "approved"]:
        broadcast_stats = trigger_job_broadcast_internal(db, job_id_str, job_dict)

    job_dict["id"] = job_id_str
    if "_id" in job_dict:
        del job_dict["_id"]

    return {
        "success": True,
        "message": f"Job vacancy created with status '{job_dict['status']}'.",
        "job": job_dict,
        "broadcast": broadcast_stats
    }

@router.get("/jobs/{job_id}")
def get_recruiter_job_detail(
    job_id: str,
    current_user: dict = Depends(get_current_recruiter),
    db: MongoDatabase = Depends(get_db)
):
    user_id_str = str(current_user["_id"])
    try:
        obj_id = ObjectId(job_id)
        job = db.jobs.find_one({"_id": obj_id, "recruiter_id": user_id_str})
    except Exception:
        job = db.jobs.find_one({"_id": job_id, "recruiter_id": user_id_str})

    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found or access unauthorized")

    job["id"] = str(job["_id"])
    del job["_id"]
    
    applicant_count = db.applications.count_documents({
        "$or": [{"job_id": job["id"]}, {"job_id": ObjectId(job["id"])}]
    })
    job["applicant_count"] = applicant_count
    return {"success": True, "job": job}

@router.put("/jobs/{job_id}")
def update_recruiter_job(
    job_id: str,
    data: RecruiterJobCreate,
    current_user: dict = Depends(get_current_recruiter),
    db: MongoDatabase = Depends(get_db)
):
    user_id_str = str(current_user["_id"])
    try:
        obj_id = ObjectId(job_id)
        job = db.jobs.find_one({"_id": obj_id, "recruiter_id": user_id_str})
    except Exception:
        job = db.jobs.find_one({"_id": job_id, "recruiter_id": user_id_str})

    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found or unauthorized")

    update_dict = data.model_dump()
    update_dict["required_skills"] = data.requirements
    update_dict["updated_at"] = datetime.now(timezone.utc)

    db.jobs.update_one({"_id": job["_id"]}, {"$set": update_dict})
    
    log_recruiter_activity(db, user_id_str, "JOB_UPDATED", {"job_id": job_id, "title": data.title})
    return {"success": True, "message": "Job posting updated successfully."}

@router.patch("/jobs/{job_id}/status")
def toggle_job_status(
    job_id: str,
    status_str: str = Query(..., alias="status", description="open or closed"),
    current_user: dict = Depends(get_current_recruiter),
    db: MongoDatabase = Depends(get_db)
):
    user_id_str = str(current_user["_id"])
    try:
        obj_id = ObjectId(job_id)
        job = db.jobs.find_one({"_id": obj_id, "recruiter_id": user_id_str})
    except Exception:
        job = db.jobs.find_one({"_id": job_id, "recruiter_id": user_id_str})

    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found or unauthorized")

    db.jobs.update_one({"_id": job["_id"]}, {"$set": {"status": status_str, "updated_at": datetime.now(timezone.utc)}})
    log_recruiter_activity(db, user_id_str, "JOB_STATUS_CHANGED", {"job_id": job_id, "new_status": status_str})
    
    return {"success": True, "message": f"Job status updated to '{status_str}'."}

# ── 5. Email Broadcast Matching Engine ──

def trigger_job_broadcast_internal(db: MongoDatabase, job_id_str: str, job_dict: dict) -> dict:
    students_cursor = db.users.find({"role": "student"})
    students_list = list(students_cursor)
    
    eligible_count = 0
    dispatched_count = 0
    errors = []

    req_skills = [s.strip().lower() for s in (job_dict.get("requirements") or job_dict.get("required_skills") or []) if s.strip()]
    min_cgpa = float(job_dict.get("min_cgpa", 0.0))
    eligible_branches = [b.strip().lower() for b in (job_dict.get("eligible_branches") or []) if b.strip()]
    job_role = (job_dict.get("role") or job_dict.get("title") or "").strip().lower()

    for st_user in students_list:
        st_id_str = str(st_user["_id"])
        st_email = st_user.get("email")
        if not st_email:
            continue

        st_prof = db.student_profiles.find_one({"user_id": st_id_str}) or {}

        # Strict eligibility evaluation: CGPA, Branch, Skills
        is_eligible, reasons, metrics = evaluate_student_job_eligibility(st_user, st_prof, job_dict)
        if not is_eligible:
            continue

        eligible_count += 1

        existing_mail = db.mail_logs.find_one({"job_id": job_id_str, "student_id": st_id_str, "status": "sent"})
        if existing_mail:
            continue

        student_name = st_prof.get("full_name") or st_user.get("name") or "Candidate"
        company_name = job_dict.get("company_name") or "Recruiter"

        success, err_msg = send_job_opportunity_email(
            student_email=st_email,
            student_name=student_name,
            job_data=job_dict,
            company_name=company_name
        )

        db.mail_logs.insert_one({
            "job_id": job_id_str,
            "student_id": st_id_str,
            "student_name": student_name,
            "student_email": st_email,
            "company_name": company_name,
            "job_title": job_dict.get("title"),
            "sent_at": datetime.now(timezone.utc),
            "status": "sent" if success else "failed",
            "error_message": err_msg,
            "match_score": metrics.get("skill_pct", 100.0)
        })

        if success:
            dispatched_count += 1
        else:
                errors.append(err_msg)

    return {
        "eligible_students": eligible_count,
        "emails_dispatched": dispatched_count,
        "failed_dispatches": len(errors)
    }

@router.post("/jobs/{job_id}/broadcast")
def trigger_manual_job_broadcast(
    job_id: str,
    current_user: dict = Depends(get_current_recruiter),
    db: MongoDatabase = Depends(get_db)
):
    user_id_str = str(current_user["_id"])
    try:
        obj_id = ObjectId(job_id)
        job = db.jobs.find_one({"_id": obj_id, "recruiter_id": user_id_str})
    except Exception:
        job = db.jobs.find_one({"_id": job_id, "recruiter_id": user_id_str})

    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found or unauthorized")

    if job.get("status") not in ["open", "approved"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot broadcast job before TPO approval.")

    stats = trigger_job_broadcast_internal(db, str(job["_id"]), job)
    log_recruiter_activity(db, user_id_str, "JOB_BROADCAST_TRIGGERED", {"job_id": job_id, "dispatched": stats["emails_dispatched"]})
    
    return {
        "success": True,
        "message": f"Broadcast complete. Dispatched {stats['emails_dispatched']} emails to eligible candidates.",
        "stats": stats
    }

# ── 6. Applicants & Candidate Detail Drawer Routes ──

@router.get("/applicants")
def get_recruiter_applicants(
    job_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_recruiter),
    db: MongoDatabase = Depends(get_db)
):
    user_id_str = str(current_user["_id"])
    recruiter_jobs = list(db.jobs.find({"recruiter_id": user_id_str}))
    
    if not recruiter_jobs:
        return {"success": True, "applicants": []}

    job_map = {str(j["_id"]): j for j in recruiter_jobs}
    
    if job_id:
        target_ids = [job_id]
        try:
            target_ids.append(ObjectId(job_id))
        except Exception:
            pass
        app_query = {"job_id": {"$in": target_ids}}
    else:
        valid_ids = []
        for j in recruiter_jobs:
            valid_ids.append(str(j["_id"]))
            valid_ids.append(j["_id"])
        app_query = {"job_id": {"$in": valid_ids}}

    if status_filter and status_filter != "All":
        app_query["status"] = status_filter

    apps_cursor = db.applications.find(app_query).sort("applied_at", -1)
    
    result = []
    for app in apps_cursor:
        st_id = app.get("student_id")
        try:
            st_user = db.users.find_one({"_id": ObjectId(st_id)})
        except Exception:
            st_user = db.users.find_one({"_id": st_id})

        st_prof = db.student_profiles.find_one({"user_id": str(st_id)}) or {}
        st_resume = db.resumes.find_one({"user_id": str(st_id), "is_active": True}) or db.resumes.find_one({"user_id": str(st_id)}) or {}

        job_doc = job_map.get(str(app.get("job_id"))) or {}

        student_name = st_prof.get("full_name") or (st_user.get("name") if st_user else "Candidate")
        student_email = st_user.get("email") if st_user else "N/A"

        if search:
            s_low = search.lower()
            if s_low not in student_name.lower() and s_low not in student_email.lower() and s_low not in (job_doc.get("title") or "").lower():
                continue

        cgpa = float(st_prof.get("cgpa", 0.0) or 0.0)
        ats_score = int(st_resume.get("ats_score", 75))
        irs_score = min(99, max(45, int((cgpa / 10.0) * 35 + (st_prof.get("profile_completion", 80) / 100.0) * 25 + (ats_score / 100.0) * 40)))

        result.append({
            "id": str(app["_id"]),
            "job_id": str(app.get("job_id")),
            "job_title": job_doc.get("title") or job_doc.get("job_title") or "Position",
            "student_id": str(st_id),
            "student_name": student_name,
            "student_email": student_email,
            "branch": st_prof.get("branch") or "N/A",
            "degree": st_prof.get("degree") or "B.Tech",
            "cgpa": cgpa,
            "skills": st_prof.get("skills") or st_resume.get("parsed_skills") or [],
            "projects": st_prof.get("projects") or [],
            "links": st_prof.get("links") or {},
            "ats_score": ats_score,
            "irs_score": irs_score,
            "resume_url": st_resume.get("file_url") or "",
            "applied_at": app.get("applied_at").strftime("%Y-%m-%d") if app.get("applied_at") else "Recently",
            "status": app.get("status", "applied")
        })

    return {"success": True, "applicants": result}

@router.get("/applicants/{app_id}")
def get_applicant_drawer_detail(
    app_id: str,
    current_user: dict = Depends(get_current_recruiter),
    db: MongoDatabase = Depends(get_db)
):
    user_id_str = str(current_user["_id"])
    try:
        app_obj_id = ObjectId(app_id)
        app = db.applications.find_one({"_id": app_obj_id})
    except Exception:
        app = db.applications.find_one({"_id": app_id})

    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    try:
        job = db.jobs.find_one({"_id": ObjectId(app["job_id"]), "recruiter_id": user_id_str})
    except Exception:
        job = db.jobs.find_one({"_id": app["job_id"], "recruiter_id": user_id_str})

    if not job:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized candidate access")

    st_id = str(app["student_id"])
    try:
        st_user = db.users.find_one({"_id": ObjectId(st_id)})
    except Exception:
        st_user = db.users.find_one({"_id": st_id})

    st_prof = db.student_profiles.find_one({"user_id": st_id}) or {}
    st_resume = db.resumes.find_one({"user_id": st_id, "is_active": True}) or db.resumes.find_one({"user_id": st_id}) or {}
    interviews = list(db.recruiter_interviews.find({"application_id": app_id}))

    for iv in interviews:
        iv["id"] = str(iv["_id"])
        del iv["_id"]

    cgpa = float(st_prof.get("cgpa", 0.0) or 0.0)
    ats_score = int(st_resume.get("ats_score", 75))
    irs_score = min(99, max(45, int((cgpa / 10.0) * 35 + (st_prof.get("profile_completion", 80) / 100.0) * 25 + (ats_score / 100.0) * 40)))

    return {
        "success": True,
        "candidate": {
            "application_id": str(app["_id"]),
            "job_id": str(app["job_id"]),
            "job_title": job.get("title"),
            "student_id": st_id,
            "student_name": st_prof.get("full_name") or (st_user.get("name") if st_user else "Candidate"),
            "student_email": st_user.get("email") if st_user else "N/A",
            "phone": st_prof.get("phone") or "N/A",
            "college": st_prof.get("college") or "University Institute",
            "degree": st_prof.get("degree") or "B.Tech",
            "branch": st_prof.get("branch") or "N/A",
            "graduation_year": st_prof.get("graduation_year") or 2026,
            "cgpa": cgpa,
            "tenth_percentage": st_prof.get("tenth_percentage"),
            "twelfth_percentage": st_prof.get("twelfth_percentage"),
            "skills": st_prof.get("skills") or st_resume.get("parsed_skills") or [],
            "projects": st_prof.get("projects") or [],
            "links": st_prof.get("links") or {},
            "ats_score": ats_score,
            "irs_score": irs_score,
            "resume_url": st_resume.get("file_url") or "",
            "status": app.get("status", "applied"),
            "applied_at": app.get("applied_at").strftime("%Y-%m-%d %H:%M") if app.get("applied_at") else "Recently",
            "interviews": interviews
        }
    }

@router.patch("/applicants/{app_id}/status")
def update_applicant_status(
    app_id: str,
    data: ApplicationStatusUpdate,
    current_user: dict = Depends(get_current_recruiter),
    db: MongoDatabase = Depends(get_db)
):
    user_id_str = str(current_user["_id"])
    try:
        app_obj_id = ObjectId(app_id)
        app = db.applications.find_one({"_id": app_obj_id})
    except Exception:
        app = db.applications.find_one({"_id": app_id})

    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    try:
        job = db.jobs.find_one({"_id": ObjectId(app["job_id"]), "recruiter_id": user_id_str})
    except Exception:
        job = db.jobs.find_one({"_id": app["job_id"], "recruiter_id": user_id_str})

    if not job:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to manage this application")

    db.applications.update_one({"_id": app["_id"]}, {"$set": {"status": data.status, "updated_at": datetime.now(timezone.utc)}})
    log_recruiter_activity(db, user_id_str, f"CANDIDATE_{data.status.upper()}", {"application_id": app_id, "new_status": data.status})

    return {"success": True, "message": f"Candidate status updated to '{data.status}'."}

# ── 7. Interview Management Routes ──

@router.get("/interviews")
def get_recruiter_interviews(current_user: dict = Depends(get_current_recruiter), db: MongoDatabase = Depends(get_db)):
    user_id_str = str(current_user["_id"])
    interviews_cursor = db.recruiter_interviews.find({"recruiter_id": user_id_str}).sort("created_at", -1)
    
    result = []
    for iv in interviews_cursor:
        st_id = iv.get("student_id")
        try:
            st_user = db.users.find_one({"_id": ObjectId(st_id)})
        except Exception:
            st_user = db.users.find_one({"_id": st_id})
            
        st_prof = db.student_profiles.find_one({"user_id": str(st_id)}) or {}
        
        try:
            job = db.jobs.find_one({"_id": ObjectId(iv.get("job_id"))})
        except Exception:
            job = db.jobs.find_one({"_id": iv.get("job_id")}) or {}

        iv["id"] = str(iv["_id"])
        del iv["_id"]
        iv["student_name"] = st_prof.get("full_name") or (st_user.get("name") if st_user else "Candidate")
        iv["job_title"] = job.get("title") or "Role"
        result.append(iv)

    return {"success": True, "interviews": result}

@router.post("/interviews")
def schedule_recruiter_interview(
    data: InterviewCreate,
    current_user: dict = Depends(get_current_recruiter),
    db: MongoDatabase = Depends(get_db)
):
    user_id_str = str(current_user["_id"])
    
    iv_dict = data.model_dump()
    iv_dict["recruiter_id"] = user_id_str
    iv_dict["status"] = "Scheduled"
    iv_dict["created_at"] = datetime.now(timezone.utc)
    iv_dict["updated_at"] = datetime.now(timezone.utc)

    res = db.recruiter_interviews.insert_one(iv_dict)
    iv_dict["id"] = str(res.inserted_id)
    if "_id" in iv_dict:
        del iv_dict["_id"]

    try:
        db.applications.update_one({"_id": ObjectId(data.application_id)}, {"$set": {"status": "interview_scheduled"}})
    except Exception:
        db.applications.update_one({"_id": data.application_id}, {"$set": {"status": "interview_scheduled"}})

    log_recruiter_activity(db, user_id_str, "INTERVIEW_SCHEDULED", {
        "interview_id": iv_dict["id"],
        "student_id": data.student_id,
        "round": data.round
    })

    return {"success": True, "message": "Interview scheduled successfully!", "interview": iv_dict}

@router.patch("/interviews/{interview_id}")
def update_recruiter_interview(
    interview_id: str,
    data: InterviewStatusUpdate,
    current_user: dict = Depends(get_current_recruiter),
    db: MongoDatabase = Depends(get_db)
):
    user_id_str = str(current_user["_id"])
    try:
        obj_id = ObjectId(interview_id)
        iv = db.recruiter_interviews.find_one({"_id": obj_id, "recruiter_id": user_id_str})
    except Exception:
        iv = db.recruiter_interviews.find_one({"_id": interview_id, "recruiter_id": user_id_str})

    if not iv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")

    upd = {k: v for k, v in data.model_dump().items() if v is not None}
    upd["updated_at"] = datetime.now(timezone.utc)

    db.recruiter_interviews.update_one({"_id": iv["_id"]}, {"$set": upd})
    log_recruiter_activity(db, user_id_str, "INTERVIEW_UPDATED", {"interview_id": interview_id, "status": data.status})

    return {"success": True, "message": "Interview details updated."}
