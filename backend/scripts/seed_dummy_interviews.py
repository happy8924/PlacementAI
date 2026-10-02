import sys
import os
from datetime import datetime, timedelta, timezone
from bson import ObjectId

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import Database

def seed_interviews():
    Database.connect_db()
    db = Database.db
    
    if db is None:
        print("ERROR: Failed to connect to MongoDB.")
        return

    # 1. Find a student user to attach the interview to
    student = db.users.find_one({"role": "student"})
    if not student:
        print("ERROR: No student found in the database. Please register a student first.")
        return
        
    student_id = student["_id"]
    print(f"Found Student: {student.get('email')} (ID: {student_id})")

    # 2. Create a Dummy Company
    company_name = "TechNova Solutions"
    company = db.companies.find_one({"name": company_name})
    if not company:
        company_res = db.companies.insert_one({
            "name": company_name,
            "description": "Leading AI and Cloud computing company",
            "industry": "Software/IT",
            "location": "Bangalore, India",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        })
        company_id = company_res.inserted_id
        print("Created Company:", company_name)
    else:
        company_id = company["_id"]
        print("Company already exists:", company_name)

    # 3. Create a Dummy Job
    job_title = "SDE-1 (Frontend)"
    job = db.jobs.find_one({"company_id": company_id, "title": job_title})
    if not job:
        job_res = db.jobs.insert_one({
            "company_id": company_id,
            "title": job_title,
            "description": "Looking for a skilled React developer",
            "status": "active",
            "package_lpa": 12.5,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        })
        job_id = job_res.inserted_id
        print("Created Job:", job_title)
    else:
        job_id = job["_id"]
        print("Job already exists:", job_title)

    # 4. Create an Application for the student
    app = db.applications.find_one({"job_id": job_id, "student_id": student_id})
    if not app:
        app_res = db.applications.insert_one({
            "job_id": job_id,
            "student_id": student_id,
            "status": "shortlisted",
            "applied_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        })
        app_id = app_res.inserted_id
        print("Created Application for Student")
    else:
        app_id = app["_id"]
        print("Application already exists for Student")

    # 5. Create Placement Rounds (The actual Scheduled Interviews)
    existing_round = db.placement_rounds.find_one({"application_id": app_id, "round_type": "Technical"})
    if not existing_round:
        db.placement_rounds.insert_many([
            {
                "application_id": app_id,
                "round_type": "Technical",
                "notes": "DSA and React Assessment",
                "result": "scheduled",
                "scheduled_at": datetime.now(timezone.utc) + timedelta(days=2, hours=4),
                "meeting_url": "https://meet.google.com/abc-defg-hij"
            },
            {
                "application_id": app_id,
                "round_type": "HR",
                "notes": "Culture Fit & Salary Discussion",
                "result": "scheduled",
                "scheduled_at": datetime.now(timezone.utc) + timedelta(days=5, hours=2),
                "meeting_url": "https://zoom.us/j/123456789"
            }
        ])
        print("Created 2 Scheduled Interviews (Placement Rounds)")
    else:
        print("Scheduled Interviews already exist")

    print("\nDummy data successfully seeded!")
    Database.close_db()

if __name__ == "__main__":
    seed_interviews()
