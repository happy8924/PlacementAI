import logging
import re
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Header, Query
from pydantic import BaseModel, Field
from pymongo.database import Database as MongoDatabase
from bson import ObjectId

from app.core.database import get_db
from app.core.security import decode_access_token
from app.services.eligibility import evaluate_student_job_eligibility

logger = logging.getLogger(__name__)

router = APIRouter()

# ── Serialization Helpers ──

def serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Recursively convert ObjectId and datetime objects to strings for clean JSON."""
    if not doc:
        return doc
    clean = {}
    for k, v in doc.items():
        if k == "_id":
            clean["id"] = str(v)
        elif isinstance(v, ObjectId):
            clean[k] = str(v)
        elif isinstance(v, datetime):
            clean[k] = v.isoformat()
        elif isinstance(v, list):
            clean[k] = [serialize_doc(item) if isinstance(item, dict) else (str(item) if isinstance(item, ObjectId) else item) for item in v]
        elif isinstance(v, dict):
            clean[k] = serialize_doc(v)
        else:
            clean[k] = v
    return clean

# ── Dependency: RBAC Guard for TPO (and Admin where appropriate) ──

def get_current_tpo_user(
    authorization: Optional[str] = Header(None),
    db: MongoDatabase = Depends(get_db)
) -> dict:
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
            detail="User account not found"
        )
        
    # Allow both 'tpo' and 'admin' roles to access TPO monitoring endpoints
    if user.get("role") not in ["tpo", "admin"]:
        logger.warning(f"Unauthorized TPO access attempt by user {user_id} with role '{user.get('role')}'")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: TPO privilege required"
        )
        
    return user

# ── Audit Logger Helper ──

def log_tpo_action(db: MongoDatabase, actor: dict, action: str, details: dict):
    try:
        actor_id = str(actor.get("_id") or actor.get("id"))
        actor_name = actor.get("name", "TPO Officer")
        actor_role = actor.get("role", "tpo")
        db.activity_logs.insert_one({
            "user_id": actor_id,
            "actor_name": actor_name,
            "role": actor_role,
            "action": f"TPO_{action.upper()}",
            "details": details,
            "timestamp": datetime.now(timezone.utc)
        })
    except Exception as e:
        logger.error(f"Failed to log TPO activity: {e}")

# ── Request / Input Schemas ──

class ApprovalDecisionInput(BaseModel):
    decision: str = Field(..., description="'approve' or 'reject'")
    reason: Optional[str] = Field(None, max_length=500, description="Mandatory if rejecting")

# ── 1. Dashboard Metrics Endpoint ──

@router.get("/dashboard/metrics")
def get_tpo_dashboard_metrics(
    current_tpo: dict = Depends(get_current_tpo_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    Returns aggregated placement statistics:
    Total students, recruiters, jobs, applications, interviews, placements,
    and pending approval counts.
    """
    total_students = db.users.count_documents({"role": "student"})
    total_recruiters = db.users.count_documents({"role": "recruiter"})
    total_jobs = db.jobs.count_documents({})
    total_applications = db.job_applications.count_documents({})
    
    # Placements count (applications with status 'offered' or 'placed' or 'accepted')
    placed_count = db.job_applications.count_documents({"status": {"$in": ["offered", "accepted", "placed"]}})
    
    # Interviews count
    interview_count = db.interviews.count_documents({}) if "interviews" in db.list_collection_names() else 0

    # Pending approvals
    pending_students = db.users.count_documents({
        "role": "student",
        "$or": [{"is_approved": False}, {"approval_status": "pending"}]
    })
    pending_recruiters = db.users.count_documents({
        "role": "recruiter",
        "$or": [{"is_approved": False}, {"approval_status": "pending"}]
    })
    pending_jobs = db.jobs.count_documents({"status": "pending_approval"})

    # Recent Audit Events (last 10)
    recent_audits = list(db.activity_logs.find({}).sort("timestamp", -1).limit(10))

    return {
        "success": True,
        "metrics": {
            "total_students": total_students,
            "total_recruiters": total_recruiters,
            "total_jobs": total_jobs,
            "total_applications": total_applications,
            "total_interviews": interview_count,
            "total_placed": placed_count,
            "pending_students": pending_students,
            "pending_recruiters": pending_recruiters,
            "pending_jobs": pending_jobs
        },
        "recent_audits": [serialize_doc(a) for a in recent_audits]
    }

# ── 2. Approvals Queue & Actions ──

@router.get("/approvals/pending")
def get_pending_approvals(
    role: Optional[str] = Query("all", description="'student', 'recruiter', 'job', or 'all'"),
    current_tpo: dict = Depends(get_current_tpo_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    Returns pending registration requests for students, recruiters, and pending jobs.
    """
    results: Dict[str, List[Any]] = {
        "students": [],
        "recruiters": [],
        "jobs": []
    }

    if role in ["all", "student"]:
        students_cursor = db.users.find({
            "role": "student",
            "$or": [{"is_approved": False}, {"approval_status": "pending"}]
        }).sort("created_at", -1)
        
        students_list = []
        for s in students_cursor:
            s_clean = serialize_doc(s)
            s_clean.pop("password_hash", None)
            # Fetch profile if exists
            prof = db.student_profiles.find_one({"user_id": str(s["_id"])})
            s_clean["profile"] = serialize_doc(prof) if prof else None
            students_list.append(s_clean)
        results["students"] = students_list

    if role in ["all", "recruiter"]:
        recruiters_cursor = db.users.find({
            "role": "recruiter",
            "$or": [{"is_approved": False}, {"approval_status": "pending"}]
        }).sort("created_at", -1)
        
        recruiters_list = []
        for r in recruiters_cursor:
            r_clean = serialize_doc(r)
            r_clean.pop("password_hash", None)
            rec_prof = db.recruiter_profiles.find_one({"user_id": str(r["_id"])})
            r_clean["profile"] = serialize_doc(rec_prof) if rec_prof else None
            recruiters_list.append(r_clean)
        results["recruiters"] = recruiters_list

    if role in ["all", "job"]:
        jobs_cursor = db.jobs.find({"status": "pending_approval"}).sort("created_at", -1)
        results["jobs"] = [serialize_doc(j) for j in jobs_cursor]

    return {
        "success": True,
        "counts": {
            "students": len(results["students"]),
            "recruiters": len(results["recruiters"]),
            "jobs": len(results["jobs"])
        },
        "data": results
    }

@router.post("/approvals/user/{user_id}")
def decide_user_approval(
    user_id: str,
    payload: ApprovalDecisionInput,
    current_tpo: dict = Depends(get_current_tpo_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    Approve or reject a student or recruiter registration.
    Rejection reason is required and stored. Duplicate decisions are prevented.
    """
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = db.users.find_one({"_id": user_id})

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User registration record not found")

    decision = payload.decision.lower().strip()
    if decision not in ["approve", "reject"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Decision must be 'approve' or 'reject'")

    if decision == "reject" and (not payload.reason or not payload.reason.strip()):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A valid rejection reason is required.")

    # Prevent conflicting/duplicate re-approval if already decided identically
    current_status = user.get("approval_status")
    if decision == "approve" and current_status == "approved" and user.get("is_approved") is True:
        return {"success": True, "message": "User is already approved.", "user_id": user_id}

    if decision == "approve":
        update_doc = {
            "is_approved": True,
            "is_active": True,
            "approval_status": "approved",
            "approved_by": current_tpo.get("name") or current_tpo.get("email"),
            "approved_at": datetime.now(timezone.utc),
            "rejection_reason": None,
            "updated_at": datetime.now(timezone.utc)
        }
    else:
        update_doc = {
            "is_approved": False,
            "is_active": False,
            "approval_status": "rejected",
            "rejected_by": current_tpo.get("name") or current_tpo.get("email"),
            "rejected_at": datetime.now(timezone.utc),
            "rejection_reason": payload.reason.strip(),
            "updated_at": datetime.now(timezone.utc)
        }

    try:
        db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_doc})
    except Exception:
        db.users.update_one({"_id": user_id}, {"$set": update_doc})

    log_tpo_action(
        db,
        actor=current_tpo,
        action=f"USER_{decision.upper()}",
        details={
            "target_user_id": user_id,
            "target_name": user.get("name"),
            "target_email": user.get("email"),
            "target_role": user.get("role"),
            "decision": decision,
            "reason": payload.reason if decision == "reject" else None
        }
    )

    return {
        "success": True,
        "message": f"User {user.get('name')} ({user.get('role')}) has been {decision}d successfully.",
        "user_id": user_id,
        "status": update_doc["approval_status"]
    }

@router.post("/approvals/job/{job_id}")
def decide_job_approval(
    job_id: str,
    payload: ApprovalDecisionInput,
    current_tpo: dict = Depends(get_current_tpo_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    Approve or reject a job posting submitted for TPO moderation.
    """
    try:
        job = db.jobs.find_one({"_id": ObjectId(job_id)})
    except Exception:
        job = db.jobs.find_one({"_id": job_id})

    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job record not found")

    decision = payload.decision.lower().strip()
    if decision not in ["approve", "reject"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Decision must be 'approve' or 'reject'")

    if decision == "reject" and (not payload.reason or not payload.reason.strip()):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Rejection reason required.")

    new_status = "open" if decision == "approve" else "rejected"
    update_doc = {
        "status": new_status,
        "reviewed_by_tpo": current_tpo.get("name") or current_tpo.get("email"),
        "reviewed_at": datetime.now(timezone.utc),
        "rejection_reason": payload.reason if decision == "reject" else None,
        "updated_at": datetime.now(timezone.utc)
    }

    try:
        db.jobs.update_one({"_id": ObjectId(job_id)}, {"$set": update_doc})
    except Exception:
        db.jobs.update_one({"_id": job_id}, {"$set": update_doc})

    log_tpo_action(
        db,
        actor=current_tpo,
        action=f"JOB_{decision.upper()}",
        details={
            "target_job_id": job_id,
            "title": job.get("title"),
            "company_name": job.get("company_name"),
            "decision": decision,
            "reason": payload.reason if decision == "reject" else None
        }
    )

    return {
        "success": True,
        "message": f"Job '{job.get('title')}' has been {decision}d.",
        "job_id": job_id,
        "status": new_status
    }

# ── 3. Student Directory & Search / Filter ──

@router.get("/students")
def list_students(
    search: Optional[str] = Query(None, description="Search by name, email, roll number, or app_id"),
    branch: Optional[str] = Query(None, description="Filter by branch"),
    graduation_year: Optional[int] = Query(None, description="Filter by graduation year"),
    min_cgpa: Optional[float] = Query(None, description="Minimum CGPA filter"),
    skill: Optional[str] = Query(None, description="Filter by skill"),
    placement_status: Optional[str] = Query(None, description="placed, unplaced, or all"),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_tpo: dict = Depends(get_current_tpo_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    Search and filter approved students. Read-only institutional directory.
    """
    # Base user query
    user_query: Dict[str, Any] = {"role": "student"}

    if search:
        safe_regex = re.escape(search.strip())
        user_query["$or"] = [
            {"name": {"$regex": safe_regex, "$options": "i"}},
            {"email": {"$regex": safe_regex, "$options": "i"}},
            {"app_id": {"$regex": safe_regex, "$options": "i"}},
            {"student_details.roll_number": {"$regex": safe_regex, "$options": "i"}}
        ]

    if branch:
        user_query["$or"] = [
            {"student_details.branch": {"$regex": re.escape(branch.strip()), "$options": "i"}},
            {"branch": {"$regex": re.escape(branch.strip()), "$options": "i"}}
        ]

    if graduation_year:
        user_query["student_details.graduation_year"] = graduation_year

    total_count = db.users.count_documents(user_query)
    skip = (page - 1) * limit
    users_cursor = db.users.find(user_query).sort("created_at", -1).skip(skip).limit(limit)

    students = []
    for u in users_cursor:
        u_id = str(u["_id"])
        clean_user = serialize_doc(u)
        clean_user.pop("password_hash", None)

        # Profile document
        prof = db.student_profiles.find_one({"user_id": u_id}) or {}
        clean_prof = serialize_doc(prof)

        # Check placed status
        has_placement = db.job_applications.find_one({
            "student_id": u_id,
            "status": {"$in": ["offered", "accepted", "placed"]}
        })
        is_placed = bool(has_placement)

        # Profile metrics
        cgpa_val = float(clean_prof.get("cgpa") or 0.0)
        skills_list = clean_prof.get("skills") or []

        # Apply secondary filters if requested
        if min_cgpa is not None and cgpa_val < min_cgpa:
            continue
        if skill and not any(skill.lower() in s.lower() for s in skills_list):
            continue
        if placement_status == "placed" and not is_placed:
            continue
        if placement_status == "unplaced" and is_placed:
            continue

        clean_user["profile"] = clean_prof
        clean_user["is_placed"] = is_placed
        clean_user["placed_details"] = serialize_doc(has_placement) if has_placement else None
        students.append(clean_user)

    return {
        "success": True,
        "page": page,
        "limit": limit,
        "total": total_count,
        "students": students
    }

@router.get("/students/{student_id}")
def get_student_detail(
    student_id: str,
    current_tpo: dict = Depends(get_current_tpo_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    Get full institutional profile, resume ATS metrics, applications, and roadmaps for a student.
    """
    try:
        user = db.users.find_one({"_id": ObjectId(student_id), "role": "student"})
    except Exception:
        user = db.users.find_one({"_id": student_id, "role": "student"})

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    u_id_str = str(user["_id"])
    clean_user = serialize_doc(user)
    clean_user.pop("password_hash", None)

    # Profile & ATS resume details
    profile = db.student_profiles.find_one({"user_id": u_id_str})
    clean_user["profile"] = serialize_doc(profile) if profile else None

    # Application history
    applications = list(db.job_applications.find({"student_id": u_id_str}).sort("applied_at", -1))
    clean_user["applications"] = [serialize_doc(a) for a in applications]

    # Roadmaps / readiness
    roadmap = db.career_roadmaps.find_one({"user_id": u_id_str})
    clean_user["roadmap"] = serialize_doc(roadmap) if roadmap else None

    return {
        "success": True,
        "student": clean_user
    }

# ── 4. Recruitment Monitoring & Eligibility Check ──

@router.get("/recruitment/jobs")
def get_recruitment_jobs(
    status_filter: Optional[str] = Query(None, description="open, closed, pending_approval, all"),
    current_tpo: dict = Depends(get_current_tpo_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    List all recruitment drives / jobs with applicant counts and eligibility summaries.
    """
    query: Dict[str, Any] = {}
    if status_filter and status_filter != "all":
        query["status"] = status_filter

    jobs = list(db.jobs.find(query).sort("created_at", -1))
    enriched_jobs = []

    for job in jobs:
        j_id = str(job["_id"])
        clean_job = serialize_doc(job)
        
        # Count total applicants for this job
        app_count = db.job_applications.count_documents({"job_id": j_id})
        shortlisted_count = db.job_applications.count_documents({"job_id": j_id, "status": "shortlisted"})
        interview_count = db.job_applications.count_documents({"job_id": j_id, "status": "interview_scheduled"})
        offered_count = db.job_applications.count_documents({"job_id": j_id, "status": {"$in": ["offered", "accepted", "placed"]}})

        clean_job["metrics"] = {
            "total_applicants": app_count,
            "shortlisted": shortlisted_count,
            "interviewing": interview_count,
            "offered": offered_count
        }
        enriched_jobs.append(clean_job)

    return {
        "success": True,
        "jobs": enriched_jobs
    }

@router.get("/recruitment/job/{job_id}/eligible-students")
def get_job_eligible_students(
    job_id: str,
    current_tpo: dict = Depends(get_current_tpo_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    Evaluate actual student profiles against stored job criteria (CGPA, Branch, Skills).
    Returns real eligibility derivation without inventing fake data.
    """
    try:
        job = db.jobs.find_one({"_id": ObjectId(job_id)})
    except Exception:
        job = db.jobs.find_one({"_id": job_id})

    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    min_cgpa = float(job.get("min_cgpa") or 0.0)
    eligible_branches = [b.strip().lower() for b in job.get("eligible_branches", [])]
    req_skills = [s.strip().lower() for s in job.get("requirements", [])]

    # Evaluate across all approved students
    students = list(db.users.find({"role": "student", "is_approved": True, "is_active": True}))
    
    eligible_list = []
    ineligible_list = []

    for st in students:
        st_id = str(st["_id"])
        prof = db.student_profiles.find_one({"user_id": st_id}) or {}
        
        is_eligible, reasons, metrics = evaluate_student_job_eligibility(st, prof, job)

        record = {
            "id": st_id,
            "app_id": st.get("app_id", ""),
            "name": st.get("name"),
            "email": st.get("email"),
            "branch": (metrics.get("branch") or "N/A").upper(),
            "cgpa": metrics.get("cgpa", 0.0),
            "matched_skills_count": len(metrics.get("matched_skills", [])),
            "total_req_skills": metrics.get("total_req_skills", 0),
            "reasons": reasons
        }

        # Check if already applied
        application = db.job_applications.find_one({"job_id": str(job["_id"]), "student_id": st_id})
        record["application_status"] = application.get("status") if application else "not_applied"

        if is_eligible:
            eligible_list.append(record)
        else:
            ineligible_list.append(record)

    return {
        "success": True,
        "job": serialize_doc(job),
        "criteria": {
            "min_cgpa": min_cgpa,
            "eligible_branches": eligible_branches,
            "requirements": req_skills
        },
        "counts": {
            "eligible": len(eligible_list),
            "ineligible": len(ineligible_list),
            "total_evaluated": len(students)
        },
        "eligible_students": eligible_list,
        "ineligible_students": ineligible_list
    }

@router.get("/recruitment/job/{job_id}/pipeline")
def get_job_pipeline_audit(
    job_id: str,
    current_tpo: dict = Depends(get_current_tpo_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    Read-only recruitment pipeline audit for TPO:
    Shows all applicants, recruiter statuses, interview stages, and feedback.
    TPO is audit-only; recruiter-controlled statuses are preserved.
    """
    try:
        job = db.jobs.find_one({"_id": ObjectId(job_id)})
    except Exception:
        job = db.jobs.find_one({"_id": job_id})

    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    applications = list(db.job_applications.find({"job_id": str(job["_id"])}).sort("applied_at", -1))
    
    enriched_apps = []
    for app in applications:
        clean_app = serialize_doc(app)
        st_user = db.users.find_one({"_id": ObjectId(app["student_id"]) if ObjectId.is_valid(app["student_id"]) else app["student_id"]})
        if st_user:
            clean_app["student_name"] = st_user.get("name")
            clean_app["student_email"] = st_user.get("email")
            clean_app["app_id"] = st_user.get("app_id")
        
        # Attach interview logs if any
        interviews = list(db.interviews.find({"application_id": str(app["_id"])}))
        clean_app["interviews"] = [serialize_doc(i) for i in interviews]
        enriched_apps.append(clean_app)

    return {
        "success": True,
        "job": serialize_doc(job),
        "total_applications": len(enriched_apps),
        "applications": enriched_apps
    }

# ── 5. Analytics & Reports ──

@router.get("/analytics/summary")
def get_placement_analytics(
    current_tpo: dict = Depends(get_current_tpo_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    Branch-wise, role-wise, and outcome placement summary.
    Distinguishes zero values from missing data clearly.
    """
    students = list(db.users.find({"role": "student"}))
    applications = list(db.job_applications.find({}))
    
    # Branch-wise aggregation
    branch_map: Dict[str, Dict[str, int]] = {}
    
    for s in students:
        s_id = str(s["_id"])
        prof = db.student_profiles.find_one({"user_id": s_id}) or {}
        raw_branch = prof.get("branch") or s.get("student_details", {}).get("branch") or "Unspecified"
        branch_name = raw_branch.strip().title()

        if branch_name not in branch_map:
            branch_map[branch_name] = {"total_students": 0, "applied": 0, "placed": 0}
        branch_map[branch_name]["total_students"] += 1

        # Check if student applied
        has_applied = any(a.get("student_id") == s_id for a in applications)
        if has_applied:
            branch_map[branch_name]["applied"] += 1

        # Check if student placed
        has_placed = any(a.get("student_id") == s_id and a.get("status") in ["offered", "accepted", "placed"] for a in applications)
        if has_placed:
            branch_map[branch_name]["placed"] += 1

    branch_summary = []
    for b_name, data in branch_map.items():
        rate = (data["placed"] / data["total_students"] * 100) if data["total_students"] > 0 else 0.0
        branch_summary.append({
            "branch": b_name,
            "total_students": data["total_students"],
            "applied": data["applied"],
            "placed": data["placed"],
            "placement_rate_pct": round(rate, 1)
        })

    # Overall application funnel
    funnel = {
        "total_applications": len(applications),
        "shortlisted": sum(1 for a in applications if a.get("status") == "shortlisted"),
        "interviewing": sum(1 for a in applications if a.get("status") == "interview_scheduled"),
        "offered": sum(1 for a in applications if a.get("status") in ["offered", "accepted", "placed"]),
        "rejected": sum(1 for a in applications if a.get("status") == "rejected")
    }

    return {
        "success": True,
        "branch_summary": branch_summary,
        "application_funnel": funnel,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# ── 6. Read-Only Audit Timeline ──

@router.get("/audit/logs")
def get_audit_timeline(
    action: Optional[str] = Query(None, description="Filter by action name"),
    limit: int = Query(50, ge=1, le=200),
    current_tpo: dict = Depends(get_current_tpo_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    Read-only audit timeline:
    Tracks registration requests, TPO decisions, approvals, rejections, job reviews,
    and placement events. Excludes passwords, tokens, and secrets.
    """
    query: Dict[str, Any] = {}
    if action:
        query["action"] = {"$regex": re.escape(action.strip()), "$options": "i"}

    logs = list(db.activity_logs.find(query).sort("timestamp", -1).limit(limit))

    clean_logs = []
    for log in logs:
        clean = serialize_doc(log)
        # Security: sanitize sensitive fields
        if "details" in clean and isinstance(clean["details"], dict):
            for sensitive_key in ["password", "password_hash", "token", "otp", "jwt", "secret"]:
                clean["details"].pop(sensitive_key, None)
        clean_logs.append(clean)

    return {
        "success": True,
        "total": len(clean_logs),
        "logs": clean_logs
    }
