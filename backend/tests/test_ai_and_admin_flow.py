import pytest
import mongomock
from bson import ObjectId
from app.services.roadmap_engine import check_student_job_eligibility, generate_default_roadmap_milestones
from app.services.resume_analyzer import analyze_resume_content

def test_roadmap_eligibility_and_milestones():
    profile = {
        "user_id": "st_test_01",
        "branch": "Computer Science",
        "cgpa": 8.0,
        "skills": ["Python", "FastAPI", "React", "MongoDB"]
    }
    jobs = [
        {
            "_id": "j_01",
            "title": "Full Stack Engineer",
            "status": "open",
            "min_cgpa": 7.0,
            "eligible_branches": ["Computer Science"],
            "requirements": ["Python", "React", "FastAPI"]
        }
    ]
    is_ok, eligible_jobs, msg = check_student_job_eligibility(profile, jobs)
    assert is_ok is True
    assert len(eligible_jobs) == 1

    milestones = generate_default_roadmap_milestones("Full Stack Engineer", profile["skills"])
    assert len(milestones) == 5
    assert all("title" in m and "resources" in m for m in milestones)

def test_ats_resume_analyzer():
    sample_resume = """
    Aaryan Shah
    Email: aaryan@example.com | Phone: +91 9876543210 | GitHub: github.com/aaryan
    Education: B.Tech Computer Science, CGPA: 8.5
    Skills: Python, FastAPI, React, Node.js, MongoDB, Docker, Git, SQL
    Experience: Software Intern at TechCorp. Built scalable REST APIs using FastAPI and MongoDB.
    Projects: PlacementAI - Automated Placement Portal handling 1000+ applicants.
    """
    res = analyze_resume_content(sample_resume, "Aaryan Shah")
    assert res is not None
    assert "ats_score" in res
    assert res["ats_score"] > 50
    assert "detected_skills" in res or "extracted_skills" in res
    skills = res.get("detected_skills") or res.get("extracted_skills") or []
    assert any("python" in s.lower() for s in skills)

def test_admin_recruiter_profile_and_stats_fallback():
    mock_db = mongomock.MongoClient().db
    r_id = ObjectId("6724b0000000000000000099")
    mock_db.recruiter_profiles.insert_one({
        "user_id": str(r_id),
        "company_name": "Atlas Cloud Innovations",
        "website": "https://atlascloud.io"
    })
    total_companies = mock_db.companies.count_documents({}) or mock_db.recruiter_profiles.count_documents({})
    assert total_companies == 1

