import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Header, Query
from pydantic import BaseModel, Field
from pymongo.database import Database as MongoDatabase
from bson import ObjectId

from app.core.database import get_db
from app.core.security import decode_access_token

logger = logging.getLogger(__name__)

router = APIRouter()

# ── BSON / Serialization Helpers ──

def serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Recursively convert ObjectId and datetime objects to strings for JSON responses."""
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


# ── Dependency: RBAC Guard for Admin ──

def get_current_admin_user(
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
        
    if user.get("role") != "admin":
        logger.warning(f"Unauthorized admin access attempt by user {user_id} with role '{user.get('role')}'")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Admin privilege required"
        )
        
    return user


# ── Request Pydantic Schemas ──

class UserStatusUpdateInput(BaseModel):
    is_active: Optional[bool] = None
    is_approved: Optional[bool] = None
    role: Optional[str] = None

class SystemSettingsInput(BaseModel):
    allow_student_registration: Optional[bool] = True
    allow_recruiter_registration: Optional[bool] = True
    ai_engine_active: Optional[bool] = True
    maintenance_mode: Optional[bool] = False
    system_announcement: Optional[str] = ""


# ── Audit Logger Helper ──

def log_admin_action(db: MongoDatabase, admin_id: str, action: str, details: dict):
    try:
        db.activity_logs.insert_one({
            "user_id": admin_id,
            "action": f"ADMIN_{action.upper()}",
            "details": details,
            "timestamp": datetime.now(timezone.utc)
        })
    except Exception as e:
        logger.error(f"Failed to log admin action: {e}")


# ── Admin Endpoints ──

@router.get("/dashboard")
def get_admin_dashboard(
    current_admin: dict = Depends(get_current_admin_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    Get aggregated real database statistics for Admin Overview Dashboard.
    """
    total_users = db.users.count_documents({})
    total_students = db.users.count_documents({"role": "student"})
    total_recruiters = db.users.count_documents({"role": "recruiter"})
    total_tpos = db.users.count_documents({"role": "tpo"})
    total_admins = db.users.count_documents({"role": "admin"})

    active_users = db.users.count_documents({"is_active": {"$ne": False}})
    pending_approvals = db.users.count_documents({"is_approved": False})

    total_companies = db.companies.count_documents({})
    total_jobs = db.jobs.count_documents({})
    active_jobs = db.jobs.count_documents({"status": "active"})
    total_applications = db.applications.count_documents({})
    placed_applications = db.applications.count_documents({"status": "selected"})

    total_resumes = db.resumes.count_documents({})
    total_ai_analyses = db.ai_analysis.count_documents({})
    total_interviews = db.interviews.count_documents({})

    # Recent 5 Users
    recent_users_cursor = db.users.find({}, {"password_hash": 0}).sort("created_at", -1).limit(5)
    recent_users = [serialize_doc(u) for u in recent_users_cursor]

    # Recent 5 Activity Logs
    recent_logs_cursor = db.activity_logs.find({}).sort("timestamp", -1).limit(5)
    recent_logs = [serialize_doc(l) for l in recent_logs_cursor]

    # Recent 5 Job Applications
    recent_apps_cursor = db.applications.find({}).sort("applied_at", -1).limit(5)
    recent_applications = [serialize_doc(a) for a in recent_apps_cursor]

    return {
        "success": True,
        "stats": {
            "users": {
                "total": total_users,
                "students": total_students,
                "recruiters": total_recruiters,
                "tpos": total_tpos,
                "admins": total_admins,
                "active": active_users,
                "pending_approval": pending_approvals
            },
            "placement": {
                "companies": total_companies,
                "jobs": total_jobs,
                "active_jobs": active_jobs,
                "applications": total_applications,
                "placements": placed_applications
            },
            "ai": {
                "resumes": total_resumes,
                "analyses": total_ai_analyses,
                "interviews": total_interviews
            }
        },
        "recent_users": recent_users,
        "recent_logs": recent_logs,
        "recent_applications": recent_applications
    }


@router.get("/users")
def list_users(
    role: Optional[str] = Query(None, description="Filter by role: student, recruiter, tpo, admin"),
    status_filter: Optional[str] = Query(None, alias="status", description="active, inactive, pending"),
    search: Optional[str] = Query(None, description="Search by name or email"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_admin: dict = Depends(get_current_admin_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    List users with search, role filter, status filter, and pagination.
    """
    query: Dict[str, Any] = {}

    if role:
        query["role"] = role.lower()

    if status_filter == "active":
        query["is_active"] = {"$ne": False}
    elif status_filter == "inactive":
        query["is_active"] = False
    elif status_filter == "pending":
        query["is_approved"] = False

    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]

    total_count = db.users.count_documents(query)
    skip = (page - 1) * limit

    cursor = db.users.find(query, {"password_hash": 0}).sort("created_at", -1).skip(skip).limit(limit)
    users = [serialize_doc(u) for u in cursor]

    return {
        "success": True,
        "total": total_count,
        "page": page,
        "limit": limit,
        "users": users
    }


@router.get("/users/{user_id}")
def get_user_detail(
    user_id: str,
    current_admin: dict = Depends(get_current_admin_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    Get detailed profile of a user, including role-specific profile and activity logs.
    """
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)}, {"password_hash": 0})
    except Exception:
        user = db.users.find_one({"_id": user_id}, {"password_hash": 0})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = serialize_doc(user)
    user_id_str = str(user["_id"])

    # Role-specific linked data
    profile_data = None
    applications = []
    resumes = []
    companies = []
    jobs = []

    if user.get("role") == "student":
        prof = db.student_profiles.find_one({"user_id": user_id_str})
        profile_data = serialize_doc(prof) if prof else None

        apps = db.applications.find({"student_id": user_id_str}).sort("applied_at", -1)
        applications = [serialize_doc(a) for a in apps]

        res_list = db.resumes.find({"user_id": user_id_str}).sort("uploaded_at", -1)
        resumes = [serialize_doc(r) for r in res_list]

    elif user.get("role") == "recruiter":
        comps = db.companies.find({"recruiter_id": user["_id"]})
        companies = [serialize_doc(c) for c in comps]

        j_list = db.jobs.find({"recruiter_id": user["_id"]})
        jobs = [serialize_doc(j) for j in j_list]

    logs = db.activity_logs.find({"user_id": user_id_str}).sort("timestamp", -1).limit(10)
    user_logs = [serialize_doc(l) for l in logs]

    return {
        "success": True,
        "user": user_data,
        "profile": profile_data,
        "applications": applications,
        "resumes": resumes,
        "companies": companies,
        "jobs": jobs,
        "activity_logs": user_logs
    }


@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: str,
    data: UserStatusUpdateInput,
    current_admin: dict = Depends(get_current_admin_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    Update user status (active/inactive, approval status, or role).
    """
    try:
        obj_id = ObjectId(user_id)
        query = {"_id": obj_id}
    except Exception:
        query = {"_id": user_id}

    target_user = db.users.find_one(query)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent deactivating self if target is current admin
    if str(target_user["_id"]) == str(current_admin["_id"]) and data.is_active is False:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own admin account")

    update_fields: Dict[str, Any] = {"updated_at": datetime.now(timezone.utc)}
    if data.is_active is not None:
        update_fields["is_active"] = data.is_active
    if data.is_approved is not None:
        update_fields["is_approved"] = data.is_approved
    if data.role and data.role in ["student", "recruiter", "tpo", "admin"]:
        update_fields["role"] = data.role

    db.users.update_one(query, {"$set": update_fields})

    log_admin_action(
        db,
        admin_id=str(current_admin["_id"]),
        action="update_user_status",
        details={
            "target_user_id": user_id,
            "target_email": target_user.get("email"),
            "updates": update_fields
        }
    )

    updated_user = db.users.find_one(query, {"password_hash": 0})
    return {
        "success": True,
        "message": "User status updated successfully",
        "user": serialize_doc(updated_user)
    }


@router.delete("/users/{user_id}")
def delete_user(
    user_id: str,
    current_admin: dict = Depends(get_current_admin_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    Deactivate or remove a user account.
    """
    try:
        query = {"_id": ObjectId(user_id)}
    except Exception:
        query = {"_id": user_id}

    target_user = db.users.find_one(query)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if str(target_user["_id"]) == str(current_admin["_id"]):
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")

    # Soft delete by deactivating
    db.users.update_one(query, {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc)}})

    log_admin_action(
        db,
        admin_id=str(current_admin["_id"]),
        action="deactivate_user",
        details={
            "target_user_id": user_id,
            "target_email": target_user.get("email")
        }
    )

    return {
        "success": True,
        "message": "User account deactivated successfully"
    }


@router.get("/roles")
def get_roles_permissions(
    current_admin: dict = Depends(get_current_admin_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    Get system roles and permission matrix with user count breakdown.
    """
    role_counts = {
        "student": db.users.count_documents({"role": "student"}),
        "recruiter": db.users.count_documents({"role": "recruiter"}),
        "tpo": db.users.count_documents({"role": "tpo"}),
        "admin": db.users.count_documents({"role": "admin"})
    }

    roles_definition = [
        {
            "role": "student",
            "title": "Student / Candidate",
            "user_count": role_counts["student"],
            "description": "Access candidate portal, build resume, request AI analysis, practice interviews, apply for jobs.",
            "permissions": ["view_jobs", "apply_jobs", "manage_resume", "generate_ai_roadmap", "take_mock_interviews"]
        },
        {
            "role": "recruiter",
            "title": "Corporate Recruiter",
            "user_count": role_counts["recruiter"],
            "description": "Manage corporate profile, post job drives, review matched applications, schedule interviews.",
            "permissions": ["create_company", "post_jobs", "view_applications", "shortlist_candidates", "schedule_interviews"]
        },
        {
            "role": "tpo",
            "title": "Training & Placement Officer",
            "user_count": role_counts["tpo"],
            "description": "Institutional oversight, candidate verification, campus drive monitoring, aggregate placement stats.",
            "permissions": ["view_all_students", "verify_candidates", "view_all_jobs", "generate_placement_reports", "manage_campus_drives"]
        },
        {
            "role": "admin",
            "title": "System Administrator",
            "user_count": role_counts["admin"],
            "description": "Full system control, user RBAC governance, AI monitoring, audit logs, system configuration.",
            "permissions": ["manage_users", "manage_roles", "view_audit_logs", "configure_system", "manage_ai_settings", "system_health"]
        }
    ]

    return {
        "success": True,
        "roles": roles_definition
    }


@router.get("/placement/jobs")
def get_placement_jobs(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_admin: dict = Depends(get_current_admin_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    Monitor all job postings / drives across recruiters.
    """
    query: Dict[str, Any] = {}
    if status_filter:
        query["status"] = status_filter
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}}
        ]

    total = db.jobs.count_documents(query)
    skip = (page - 1) * limit
    cursor = db.jobs.find(query).sort("created_at", -1).skip(skip).limit(limit)

    jobs = []
    for j in cursor:
        job_obj = serialize_doc(j)
        # Attach application count
        job_obj["applicant_count"] = db.applications.count_documents({"job_id": j["_id"]})
        # Attach company name if available
        if j.get("company_id"):
            comp = db.companies.find_one({"_id": j["company_id"]})
            if comp:
                job_obj["company_name"] = comp.get("name")
        jobs.append(job_obj)

    return {
        "success": True,
        "total": total,
        "page": page,
        "limit": limit,
        "jobs": jobs
    }


@router.get("/placement/applications")
def get_placement_applications(
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_admin: dict = Depends(get_current_admin_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    Monitor placement applications across all jobs and candidates.
    """
    query: Dict[str, Any] = {}
    if status_filter:
        query["status"] = status_filter

    total = db.applications.count_documents(query)
    skip = (page - 1) * limit
    cursor = db.applications.find(query).sort("applied_at", -1).skip(skip).limit(limit)

    applications = []
    for app in cursor:
        app_obj = serialize_doc(app)
        # Enrich with student details
        student_id = app.get("student_id")
        if student_id:
            try:
                stu_user = db.users.find_one({"_id": ObjectId(student_id)})
            except Exception:
                stu_user = db.users.find_one({"_id": student_id})
            if stu_user:
                app_obj["student_name"] = stu_user.get("name")
                app_obj["student_email"] = stu_user.get("email")

        # Enrich with job details
        job_id = app.get("job_id")
        if job_id:
            try:
                job_doc = db.jobs.find_one({"_id": ObjectId(job_id)})
            except Exception:
                job_doc = db.jobs.find_one({"_id": job_id})
            if job_doc:
                app_obj["job_title"] = job_doc.get("title")

        applications.append(app_obj)

    return {
        "success": True,
        "total": total,
        "page": page,
        "limit": limit,
        "applications": applications
    }


@router.get("/placement/interviews")
def get_placement_interviews(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_admin: dict = Depends(get_current_admin_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    Monitor candidate mock interviews.
    """
    total = db.interviews.count_documents({})
    skip = (page - 1) * limit
    cursor = db.interviews.find({}).sort("created_at", -1).skip(skip).limit(limit)

    interviews = []
    for iv in cursor:
        iv_obj = serialize_doc(iv)
        user_id = iv.get("user_id")
        if user_id:
            try:
                user = db.users.find_one({"_id": ObjectId(user_id)})
            except Exception:
                user = db.users.find_one({"_id": user_id})
            if user:
                iv_obj["candidate_name"] = user.get("name")
                iv_obj["candidate_email"] = user.get("email")
        interviews.append(iv_obj)

    return {
        "success": True,
        "total": total,
        "page": page,
        "limit": limit,
        "interviews": interviews
    }


@router.get("/ai/overview")
def get_ai_overview(
    current_admin: dict = Depends(get_current_admin_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    AI Center statistics: analyses count, resumes parsed, ATS score metrics.
    """
    total_resumes = db.resumes.count_documents({})
    completed_resumes = db.resumes.count_documents({"analysis_status": "completed"})
    total_ai_analyses = db.ai_analysis.count_documents({})
    total_roadmaps = db.learning_roadmaps.count_documents({})

    # Average ATS score calculation using aggregation
    pipeline = [
        {"$match": {"ats_score": {"$ne": None}}},
        {"$group": {"_id": None, "avg_ats": {"$avg": "$ats_score"}}}
    ]
    ats_res = list(db.resumes.aggregate(pipeline))
    avg_ats_score = round(ats_res[0]["avg_ats"], 1) if ats_res else 0.0

    # Recent AI Analyses
    recent_analyses_cursor = db.ai_analysis.find({}).sort("generated_at", -1).limit(5)
    recent_analyses = [serialize_doc(a) for a in recent_analyses_cursor]

    return {
        "success": True,
        "stats": {
            "total_resumes": total_resumes,
            "completed_resumes": completed_resumes,
            "total_ai_analyses": total_ai_analyses,
            "total_roadmaps": total_roadmaps,
            "average_ats_score": avg_ats_score
        },
        "recent_analyses": recent_analyses
    }


@router.get("/system/health")
def get_system_health(
    current_admin: dict = Depends(get_current_admin_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    System and MongoDB collection metrics.
    """
    collection_names = [
        "users", "student_profiles", "companies", "jobs",
        "applications", "resumes", "ai_analysis", "learning_roadmaps",
        "interviews", "placement_rounds", "placement_stats", "activity_logs",
        "otp_codes", "password_reset_tokens"
    ]

    collections_stats = {}
    for col_name in collection_names:
        collections_stats[col_name] = db[col_name].count_documents({})

    return {
        "success": True,
        "database_status": "connected",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "collections": collections_stats
    }


@router.get("/audit-logs")
def get_audit_logs(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_admin: dict = Depends(get_current_admin_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    Query system activity and audit logs.
    """
    query: Dict[str, Any] = {}
    if search:
        query["$or"] = [
            {"action": {"$regex": search, "$options": "i"}},
            {"user_id": {"$regex": search, "$options": "i"}}
        ]

    total = db.activity_logs.count_documents(query)
    skip = (page - 1) * limit
    cursor = db.activity_logs.find(query).sort("timestamp", -1).skip(skip).limit(limit)

    logs = []
    for l in cursor:
        log_obj = serialize_doc(l)
        # Attempt resolving user name
        u_id = l.get("user_id")
        if u_id:
            try:
                u = db.users.find_one({"_id": ObjectId(u_id)}, {"name": 1, "email": 1})
            except Exception:
                u = db.users.find_one({"_id": u_id}, {"name": 1, "email": 1})
            if u:
                log_obj["user_name"] = u.get("name")
                log_obj["user_email"] = u.get("email")
        logs.append(log_obj)

    return {
        "success": True,
        "total": total,
        "page": page,
        "limit": limit,
        "logs": logs
    }


@router.get("/reports")
def get_placement_reports(
    current_admin: dict = Depends(get_current_admin_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    Aggregated reports for placement drives and analytics.
    """
    total_students = db.users.count_documents({"role": "student"})
    total_jobs = db.jobs.count_documents({})
    placed_students = db.applications.count_documents({"status": "selected"})

    # Calculate average package LPA from active/all jobs
    pipeline_pkg = [
        {"$match": {"package_lpa": {"$ne": None}}},
        {"$group": {"_id": None, "avg_pkg": {"$avg": "$package_lpa"}, "max_pkg": {"$max": "$package_lpa"}}}
    ]
    pkg_res = list(db.jobs.aggregate(pipeline_pkg))
    avg_package = round(pkg_res[0]["avg_pkg"], 2) if pkg_res else 0.0
    highest_package = round(pkg_res[0]["max_pkg"], 2) if pkg_res else 0.0

    placement_rate = round((placed_students / total_students * 100), 1) if total_students > 0 else 0.0

    return {
        "success": True,
        "report": {
            "total_students": total_students,
            "placed_students": placed_students,
            "placement_rate_percentage": placement_rate,
            "total_jobs": total_jobs,
            "average_package_lpa": avg_package,
            "highest_package_lpa": highest_package,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
    }


@router.get("/settings")
def get_system_settings(
    current_admin: dict = Depends(get_current_admin_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    Get platform-wide system settings.
    """
    settings_doc = db.system_settings.find_one({"_id": "global_config"})
    if not settings_doc:
        settings_doc = {
            "_id": "global_config",
            "allow_student_registration": True,
            "allow_recruiter_registration": True,
            "ai_engine_active": True,
            "maintenance_mode": False,
            "system_announcement": "Welcome to PlacementAI Admin Console"
        }
    return {
        "success": True,
        "settings": serialize_doc(settings_doc)
    }


@router.put("/settings")
def update_system_settings(
    data: SystemSettingsInput,
    current_admin: dict = Depends(get_current_admin_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    Update platform-wide system settings.
    """
    update_data = data.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc)

    db.system_settings.update_one(
        {"_id": "global_config"},
        {"$set": update_data},
        upsert=True
    )

    log_admin_action(
        db,
        admin_id=str(current_admin["_id"]),
        action="update_settings",
        details=update_data
    )

    saved = db.system_settings.find_one({"_id": "global_config"})
    return {
        "success": True,
        "message": "System settings updated successfully",
        "settings": serialize_doc(saved)
    }
