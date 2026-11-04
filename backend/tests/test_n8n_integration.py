import pytest
import mongomock
from app.services.n8n import format_n8n_job_payload, dispatch_job_broadcast_to_n8n
from app.core.config import settings

def test_format_n8n_job_payload():
    raw_job = {
        "_id": "6724cb1234567890abcdef12",
        "title": "Software Development Engineer",
        "role": "SDE 1",
        "company_name": "Google India",
        "min_cgpa": 7.5,
        "eligible_branches": ["Computer Science", "Information Technology"],
        "requirements": ["Python", "FastAPI", "React"],
        "description": "Building scalable backend services.",
        "location": "Bengaluru",
        "work_mode": "Hybrid",
        "salary_package": "24 LPA"
    }

    formatted = format_n8n_job_payload(raw_job)

    assert formatted["jobId"] == "6724cb1234567890abcdef12"
    assert formatted["jobTitle"] == "Software Development Engineer"
    assert formatted["role"] == "SDE 1"
    assert formatted["companyName"] == "Google India"
    assert formatted["minimumCGPA"] == 7.5
    assert formatted["eligibleBranches"] == ["Computer Science", "Information Technology"]
    assert formatted["requiredSkills"] == ["Python", "FastAPI", "React"]
    assert formatted["salaryOrStipend"] == "24 LPA"
    assert "applyLink" in formatted

def test_dispatch_with_zero_recipients():
    mock_db = mongomock.MongoClient().db
    job = {"_id": "test_job_1", "title": "DevOps Engineer"}

    result = dispatch_job_broadcast_to_n8n(mock_db, "test_job_1", job, [])

    assert result["success"] is True
    assert result["dispatched_count"] == 0
    assert result["status"] == "no_eligible_candidates"

def test_dispatch_simulation_mode_and_idempotency(monkeypatch):
    monkeypatch.setattr(settings, "N8N_WEBHOOK_URL", "")
    import app.services.email as email_service
    monkeypatch.setattr(email_service, "send_job_opportunity_email", lambda *args, **kwargs: (True, ""))
    mock_db = mongomock.MongoClient().db
    job = {
        "_id": "job_101",
        "title": "Backend Intern",
        "company_name": "Acme Corp"
    }

    recipients = [
        {
            "student_id": "st_001",
            "student_name": "Aaryan Shah",
            "student_email": "aaryan@college.edu",
            "match_score": 90.0,
            "matched_skills": ["Python", "FastAPI"]
        },
        {
            "student_id": "st_002",
            "student_name": "Rahul Verma",
            "student_email": "rahul@college.edu",
            "match_score": 80.0,
            "matched_skills": ["Python"]
        }
    ]

    # First dispatch - should dispatch to both
    first_res = dispatch_job_broadcast_to_n8n(mock_db, "job_101", job, recipients)
    assert first_res["success"] is True
    assert first_res["dispatched_count"] >= 0
    assert first_res["status"] in ("simulated", "dispatched")

    # Verify mail_logs has 2 entries
    logs = list(mock_db.mail_logs.find({"job_id": "job_101"}))
    assert len(logs) == 2
    assert all(l["status"] == "sent" for l in logs)

    # Second dispatch with identical recipients - should be idempotent and skip already sent
    second_res = dispatch_job_broadcast_to_n8n(mock_db, "job_101", job, recipients)
    assert second_res["success"] is True
    assert second_res["dispatched_count"] == 0
    assert second_res["already_sent_count"] == 2
    assert second_res["status"] == "already_broadcasted"


def test_dispatch_with_mocked_webhook_success(monkeypatch):
    monkeypatch.setattr(settings, "N8N_WEBHOOK_URL", "https://n8n.example.com/webhook/placementai-job-broadcast")
    mock_db = mongomock.MongoClient().db
    job = {"_id": "job_202", "title": "Data Scientist", "recruiter_id": "rec_01"}
    recipients = [{"student_id": "st_99", "student_name": "Priya", "student_email": "priya@example.com"}]

    class MockResponse:
        status_code = 200
        text = '{"success": true, "status": "completed"}'
        def json(self):
            return {"success": True, "status": "completed"}

    class MockClient:
        def __init__(self, *args, **kwargs):
            pass
        def __enter__(self):
            return self
        def __exit__(self, *args):
            pass
        def post(self, url, **kwargs):
            assert url == "https://n8n.example.com/webhook/placementai-job-broadcast"
            assert "json" in kwargs
            assert kwargs["json"]["job"]["jobId"] == "job_202"
            return MockResponse()

    import httpx
    monkeypatch.setattr(httpx, "Client", MockClient)

    res = dispatch_job_broadcast_to_n8n(mock_db, "job_202", job, recipients)
    assert res["success"] is True
    assert res["status"] == "dispatched"
    assert res["dispatched_count"] == 1

def test_dispatch_with_mocked_webhook_failure(monkeypatch):
    monkeypatch.setattr(settings, "N8N_WEBHOOK_URL", "https://n8n.example.com/webhook/placementai-job-broadcast")
    mock_db = mongomock.MongoClient().db
    job = {"_id": "job_303", "title": "Cloud Architect", "recruiter_id": "rec_02"}
    recipients = [{"student_id": "st_88", "student_name": "Karan", "student_email": "karan@example.com"}]

    class MockErrorResponse:
        status_code = 500
        text = "Internal Server Error"
        def json(self):
            raise ValueError("Not JSON")

    class MockErrorClient:
        def __init__(self, *args, **kwargs):
            pass
        def __enter__(self):
            return self
        def __exit__(self, *args):
            pass
        def post(self, url, **kwargs):
            return MockErrorResponse()

    import httpx
    monkeypatch.setattr(httpx, "Client", MockErrorClient)

    res = dispatch_job_broadcast_to_n8n(mock_db, "job_303", job, recipients)
    assert res["success"] is False
    assert res["status"] == "failed"
    assert "error" in res

    # Check failure is logged in mail_logs
    failed_logs = list(mock_db.mail_logs.find({"job_id": "job_303"}))
    assert len(failed_logs) == 1
    assert failed_logs[0]["status"] == "failed"
