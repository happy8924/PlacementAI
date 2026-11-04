import pytest
import mongomock
from bson import ObjectId
from datetime import datetime, timezone

from app.services.eligibility import evaluate_student_job_eligibility
from app.services.n8n import format_n8n_job_payload, dispatch_job_broadcast_to_n8n

def test_student_profile_completion_and_eligibility():
    # Incomplete student profile (missing CGPA & skills)
    st_user = {
        "_id": ObjectId("6724a0000000000000000001"),
        "name": "Arjun Kumar",
        "email": "arjun@univ.edu",
        "role": "student",
        "is_approved": True,
        "approval_status": "approved"
    }
    incomplete_profile = {
        "user_id": str(st_user["_id"]),
        "full_name": "Arjun Kumar",
        "cgpa": None,
        "skills": []
    }
    job = {
        "_id": ObjectId("6724b0000000000000000001"),
        "title": "Software Engineer",
        "min_cgpa": 7.0,
        "eligible_branches": ["Computer Science"],
        "requirements": ["Python", "React"]
    }

    # Should be flagged as ineligible
    is_eligible, reasons, metrics = evaluate_student_job_eligibility(st_user, incomplete_profile, job)
    assert is_eligible is False

    # Complete student profile meeting all criteria
    complete_profile = {
        "user_id": str(st_user["_id"]),
        "full_name": "Arjun Kumar",
        "branch": "Computer Science",
        "cgpa": 8.5,
        "skills": ["Python", "React", "FastAPI", "MongoDB"]
    }

    is_eligible, reasons, metrics = evaluate_student_job_eligibility(st_user, complete_profile, job)
    assert is_eligible is True
    assert metrics["cgpa"] == 8.5
    assert len(reasons) == 0

def test_end_to_end_application_and_interview_harmonization():
    mock_db = mongomock.MongoClient().db

    student_id = "6724a0000000000000000010"
    recruiter_id = "6724b0000000000000000010"
    job_id = "6724c0000000000000000010"

    # 1. Create Job in DB
    mock_db.jobs.insert_one({
        "_id": ObjectId(job_id),
        "title": "Full Stack Engineer",
        "company_name": "TechCorp Global",
        "recruiter_id": recruiter_id,
        "status": "open",
        "min_cgpa": 7.0,
        "eligible_branches": ["Computer Science"],
        "requirements": ["Python", "FastAPI"]
    })

    # 2. Student applies to job
    app_res = mock_db.applications.insert_one({
        "job_id": ObjectId(job_id),
        "job_id_str": job_id,
        "student_id": ObjectId(student_id),
        "student_id_str": student_id,
        "status": "applied",
        "applied_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    })
    application_id = str(app_res.inserted_id)

    # 3. Recruiter queries applicants
    valid_ids = [job_id, ObjectId(job_id)]
    applicants = list(mock_db.applications.find({"job_id": {"$in": valid_ids}}))
    assert len(applicants) == 1
    assert str(applicants[0]["student_id"]) == student_id

    # 4. Recruiter shortlists candidate
    mock_db.applications.update_one(
        {"_id": ObjectId(application_id)},
        {"$set": {"status": "shortlisted"}}
    )
    updated_app = mock_db.applications.find_one({"_id": ObjectId(application_id)})
    assert updated_app["status"] == "shortlisted"

    # 5. Recruiter schedules interview (saved to canonical interviews collection)
    mock_db.interviews.insert_one({
        "application_id": application_id,
        "student_id": student_id,
        "user_id": student_id,
        "job_id": job_id,
        "recruiter_id": recruiter_id,
        "round": "Technical Round 1",
        "interview_type": "Technical",
        "date": "2026-11-15",
        "time": "10:30 AM",
        "mode": "Online",
        "meeting_link": "https://meet.google.com/xyz-abc-def",
        "status": "Scheduled",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    })

    # 6. Student queries their interviews
    target_ids = [student_id, ObjectId(student_id)]
    student_interviews = list(mock_db.interviews.find({
        "$or": [
            {"student_id": {"$in": target_ids}},
            {"user_id": {"$in": target_ids}}
        ]
    }))
    assert len(student_interviews) == 1
    iv = student_interviews[0]
    assert iv["round"] == "Technical Round 1"
    assert iv["meeting_link"] == "https://meet.google.com/xyz-abc-def"
    assert iv["status"] == "Scheduled"

    # 7. TPO queries application count & pipeline
    tpo_apps = list(mock_db.applications.find({"job_id": {"$in": valid_ids}}))
    assert len(tpo_apps) == 1
    assert tpo_apps[0]["status"] == "shortlisted"


def test_preview_eligibility_calculation():
    mock_db = mongomock.MongoClient().db

    # Add 2 students to mock_db
    st1_id = ObjectId("6724a0000000000000000021")
    st2_id = ObjectId("6724a0000000000000000022")

    mock_db.users.insert_many([
        {"_id": st1_id, "name": "Rohan Patel", "email": "rohan@college.edu", "role": "student", "is_approved": True, "app_id": "ST-001"},
        {"_id": st2_id, "name": "Meera Joshi", "email": "meera@college.edu", "role": "student", "is_approved": True, "app_id": "ST-002"}
    ])

    mock_db.student_profiles.insert_many([
        {"user_id": str(st1_id), "full_name": "Rohan Patel", "branch": "Information Technology", "cgpa": 8.2, "skills": ["React", "Node.js", "Python"]},
        {"user_id": str(st2_id), "full_name": "Meera Joshi", "branch": "Mechanical", "cgpa": 6.1, "skills": ["AutoCAD"]}
    ])

    # Input criteria: Min CGPA 7.5, branch IT, skills React, Python
    input_criteria = {
        "title": "Frontend Engineer",
        "min_cgpa": 7.5,
        "eligible_branches": ["Information Technology"],
        "requirements": ["React", "Python"]
    }

    students = list(mock_db.users.find({"role": "student"}))
    eligible = []
    for s in students:
        prof = mock_db.student_profiles.find_one({"user_id": str(s["_id"])}) or {}
        is_ok, reasons, metrics = evaluate_student_job_eligibility(s, prof, input_criteria)
        if is_ok:
            eligible.append({"name": s["name"], "id": s["app_id"], "cgpa": prof["cgpa"]})

    assert len(eligible) == 1
    assert eligible[0]["name"] == "Rohan Patel"
    assert eligible[0]["id"] == "ST-001"


def test_skill_match_seventy_percent_threshold():
    st_user = {
        "_id": ObjectId("6724a0000000000000000099"),
        "name": "Priya Sharma",
        "role": "student",
        "is_approved": True
    }
    # Job requires 4 skills
    job = {
        "min_cgpa": 6.0,
        "eligible_branches": ["Computer Science"],
        "requirements": ["Python", "FastAPI", "Docker", "PostgreSQL"]
    }

    # Student has 2 of 4 skills (50%) -> Must fail under 70% threshold
    profile_fifty_pct = {
        "user_id": str(st_user["_id"]),
        "branch": "Computer Science",
        "cgpa": 8.0,
        "skills": ["Python", "FastAPI"]
    }
    is_ok, reasons, metrics = evaluate_student_job_eligibility(st_user, profile_fifty_pct, job)
    assert is_ok is False
    assert metrics["skill_pct"] == 50.0
    assert any("70% threshold" in r for r in reasons)

    # Student has 3 of 4 skills (75%) -> Must pass under 70% threshold
    profile_seventy_five_pct = {
        "user_id": str(st_user["_id"]),
        "branch": "Computer Science",
        "cgpa": 8.0,
        "skills": ["Python", "FastAPI", "Docker"]
    }
    is_ok_pass, reasons_pass, metrics_pass = evaluate_student_job_eligibility(st_user, profile_seventy_five_pct, job)
    assert is_ok_pass is True
    assert metrics_pass["skill_pct"] == 75.0
    assert len(reasons_pass) == 0
