import logging
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel, Field
from pymongo.database import Database as MongoDatabase
from bson import ObjectId

from app.core.database import get_db
from app.core.security import decode_access_token
from app.services.roadmap_engine import (
    check_student_job_eligibility,
    generate_default_roadmap_milestones,
    calculate_roadmap_stats
)
from app.api.v1.jobs import seed_default_jobs_if_empty

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
    return user

class MilestoneUpdateInput(BaseModel):
    milestone_id: int
    new_status: str = Field(..., description="completed, in_progress, or upcoming")


@router.get("/my-roadmap")
def get_student_roadmap(
    current_user: dict = Depends(get_current_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    1. Seed default jobs if DB is empty.
    2. Check if student is eligible for any active recruiter job posting.
    3. If ineligible, return message: "abhi aapke roles ke specific koi compaany nahi he to roadmap available nahi he."
    4. If eligible, load or generate personalized milestone roadmap for student with progress tracking.
    """
    user_id_str = str(current_user["_id"])
    seed_default_jobs_if_empty(db)

    # Fetch student profile & active resume
    profile = db.student_profiles.find_one({"user_id": user_id_str}) or {}
    active_resume = db.resumes.find_one({"user_id": user_id_str, "is_active": True}) or {}

    # Fetch all open jobs
    all_jobs_cursor = db.jobs.find({"status": "open"})
    all_jobs = list(all_jobs_cursor)

    # Rule Check: Job Eligibility
    is_eligible, eligible_jobs, eligibility_msg = check_student_job_eligibility(profile, all_jobs)

    if not is_eligible:
        return {
            "success": True,
            "is_eligible": False,
            "message": "abhi aapke roles ke specific koi compaany nahi he to roadmap available nahi he.",
            "student_criteria": {
                "branch": profile.get("branch") or "Not Specified",
                "cgpa": profile.get("cgpa") or 0.0,
                "degree": profile.get("degree") or "Not Specified"
            },
            "roadmap": None
        }

    # Target Role selection
    primary_job = eligible_jobs[0] if eligible_jobs else {}
    target_role = (
        primary_job.get("title") or
        (profile.get("preferred_roles")[0] if profile.get("preferred_roles") else None) or
        (active_resume.get("recommended_roles")[0] if active_resume.get("recommended_roles") else "Senior Full Stack & AI Systems Architect")
    )

    # Current level string calculation
    grad_year = profile.get("graduation_year")
    branch_str = profile.get("branch") or "CS"
    current_level = f"Final Year Student ({branch_str})" if grad_year and grad_year <= 2026 else f"Student ({branch_str})"
    target_goal = "Tier 1 Staff Engineer Track"

    # Check if student already has a saved roadmap state
    saved_roadmap = db.student_roadmaps.find_one({"user_id": user_id_str})

    if saved_roadmap:
        milestones = saved_roadmap.get("milestones", [])
    else:
        # Generate new personalized roadmap milestones
        user_skills = profile.get("skills", []) + active_resume.get("detected_skills", [])
        milestones = generate_default_roadmap_milestones(target_role, user_skills)

        # Save to DB
        stats = calculate_roadmap_stats(milestones)
        roadmap_doc = {
            "user_id": user_id_str,
            "target_role": target_role,
            "current_level": current_level,
            "target_goal": target_goal,
            "milestones": milestones,
            "stats": stats,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        db.student_roadmaps.insert_one(roadmap_doc)
        saved_roadmap = roadmap_doc

    stats = calculate_roadmap_stats(milestones)

    return {
        "success": True,
        "is_eligible": True,
        "message": "Roadmap retrieved successfully.",
        "eligible_companies_count": len(eligible_jobs),
        "target_job": {
            "title": primary_job.get("title"),
            "company_name": primary_job.get("company_name"),
            "salary_package": primary_job.get("salary_package")
        },
        "roadmap": {
            "target_role": saved_roadmap.get("target_role", target_role),
            "current_level": current_level,
            "target_goal": target_goal,
            "stats": stats,
            "milestones": milestones
        }
    }


@router.post("/update-milestone")
def update_milestone_status(
    data: MilestoneUpdateInput,
    current_user: dict = Depends(get_current_user),
    db: MongoDatabase = Depends(get_db)
):
    """Update progress status for a milestone node and re-calculate total completed/remaining weeks & completion %."""
    user_id_str = str(current_user["_id"])

    if data.new_status not in ["completed", "in_progress", "upcoming"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be 'completed', 'in_progress', or 'upcoming'."
        )

    roadmap = db.student_roadmaps.find_one({"user_id": user_id_str})
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap not found for current student."
        )

    milestones = roadmap.get("milestones", [])
    found = False
    for m in milestones:
        if m.get("id") == data.milestone_id:
            m["status"] = data.new_status
            found = True
            break

    if not found:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Milestone node ID {data.milestone_id} not found."
        )

    # Recalculate stats
    new_stats = calculate_roadmap_stats(milestones)

    # Update in DB
    db.student_roadmaps.update_one(
        {"user_id": user_id_str},
        {"$set": {
            "milestones": milestones,
            "stats": new_stats,
            "updated_at": datetime.now(timezone.utc)
        }}
    )

    return {
        "success": True,
        "message": "Milestone progress updated!",
        "stats": new_stats,
        "milestones": milestones
    }
