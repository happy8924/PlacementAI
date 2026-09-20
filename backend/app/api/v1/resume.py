import logging
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Header
from pymongo.database import Database as MongoDatabase
from bson import ObjectId

from app.core.database import get_db
from app.core.security import decode_access_token
from app.services.resume_analyzer import (
    extract_text_from_pdf,
    verify_student_identity,
    analyze_resume_content
)

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

# ── API Endpoints ──

@router.post("/upload")
async def upload_and_analyze_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: MongoDatabase = Depends(get_db)
):
    """
    Upload PDF resume, verify student identity against account name/email,
    run ATS score evaluation, extract tech skills & roles, and auto-sync to student profile.
    """
    user_id_str = str(current_user["_id"])
    student_name = current_user.get("name", "")
    student_email = current_user.get("email", "")

    # 1. Validate File Type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF resumes are accepted."
        )

    # Read File Bytes
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum limit of 5MB."
        )

    # 2. Extract PDF Text
    try:
        raw_text = extract_text_from_pdf(contents)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )

    # 3. Verify Candidate Identity
    verified, verify_reason = verify_student_identity(raw_text, student_name, student_email)
    if not verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=verify_reason
        )

    # 4. Perform ATS Analysis & Extraction
    analysis = analyze_resume_content(raw_text, student_name)

    # 5. Deactivate previous resumes for this student
    db.resumes.update_many(
        {"user_id": user_id_str},
        {"$set": {"is_active": False}}
    )

    # 6. Save Resume Document into MongoDB
    resume_doc = {
        "user_id": user_id_str,
        "file_name": file.filename,
        "ats_score": analysis["ats_score"],
        "score_breakdown": analysis["score_breakdown"],
        "detected_skills": analysis["detected_skills"],
        "recommended_roles": analysis["recommended_roles"],
        "strengths": analysis["strengths"],
        "improvements": analysis["improvements"],
        "missing_keywords": analysis["missing_keywords"],
        "word_count": analysis["word_count"],
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    result = db.resumes.insert_one(resume_doc)
    resume_id_str = str(result.inserted_id)

    # 7. Auto-Sync Detected Skills & Recommended Roles to Student Profile
    existing_profile = db.student_profiles.find_one({"user_id": user_id_str}) or {}
    
    # Merge skills (keep existing custom skills + append detected skills)
    current_skills = existing_profile.get("skills", [])
    merged_skills = list(set(current_skills + analysis["detected_skills"]))

    # Update profile fields
    profile_updates = {
        "user_id": user_id_str,
        "skills": merged_skills,
        "preferred_roles": analysis["recommended_roles"],
        "resume_id": resume_id_str,
        "interview_readiness_score": analysis["ats_score"],  # Initial baseline
        "resume_synced": True,
        "resume_synced_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    # Recalculate profile completion
    from app.api.v1.student import calculate_profile_completion
    merged_profile_obj = {**existing_profile, **profile_updates}
    completion_pct, is_complete = calculate_profile_completion(merged_profile_obj, student_name)
    profile_updates["profile_completion"] = completion_pct
    profile_updates["profile_completed"] = is_complete

    db.student_profiles.update_one(
        {"user_id": user_id_str},
        {"$set": profile_updates, "$setOnInsert": {"created_at": datetime.now(timezone.utc), "placement_status": "unplaced"}},
        upsert=True
    )

    resume_doc["id"] = resume_id_str
    if "_id" in resume_doc:
        del resume_doc["_id"]

    return {
        "success": True,
        "message": "Resume uploaded and analyzed successfully! Profile skills and roles synced.",
        "analysis": resume_doc,
        "synced_skills": merged_skills,
        "synced_roles": analysis["recommended_roles"]
    }

@router.get("/active")
def get_active_resume(
    current_user: dict = Depends(get_current_user),
    db: MongoDatabase = Depends(get_db)
):
    """Fetch active analyzed resume for the student."""
    user_id_str = str(current_user["_id"])
    resume = db.resumes.find_one({"user_id": user_id_str, "is_active": True})
    
    if not resume:
        return {
            "success": True,
            "has_resume": False,
            "resume": None
        }

    resume["id"] = str(resume["_id"])
    del resume["_id"]

    return {
        "success": True,
        "has_resume": True,
        "resume": resume
    }

@router.delete("/{resume_id}")
def delete_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user),
    db: MongoDatabase = Depends(get_db)
):
    """Delete uploaded resume."""
    user_id_str = str(current_user["_id"])
    try:
        obj_id = ObjectId(resume_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid resume ID.")

    res = db.resumes.delete_one({"_id": obj_id, "user_id": user_id_str})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resume not found.")

    # Reset active resume ref in profile
    db.student_profiles.update_one(
        {"user_id": user_id_str},
        {"$set": {"resume_id": None, "resume_synced": False, "updated_at": datetime.now(timezone.utc)}}
    )

    return {
        "success": True,
        "message": "Resume deleted successfully."
    }
