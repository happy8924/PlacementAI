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

    # 1. Find all student users to attach interviews to
    students = list(db.users.find({"role": "student"}))
    if not students:
        print("ERROR: No student users found in the database. Please register a student first.")
        return
        
    print(f"Found {len(students)} student(s) in database.")

    # 2. Create or find Dummy Company
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

    # 3. Create or find Dummy Job
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

    # Clean up incomplete/invalid placement_rounds missing round_number if any
    db.placement_rounds.delete_many({"round_number": None})

    for student in students:
        student_id = student["_id"]
        student_email = student.get("email", "Unknown")
        print(f"\nProcessing Student: {student_email} (ID: {student_id})")

        # 4. Create an Application for the student (checking string & ObjectId formats)
        app = db.applications.find_one({
            "job_id": job_id,
            "$or": [{"student_id": str(student_id)}, {"student_id": student_id}]
        })
        
        if not app:
            app_res = db.applications.insert_one({
                "job_id": job_id,
                "student_id": str(student_id),
                "status": "shortlisted",
                "applied_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            })
            app_id = app_res.inserted_id
            print(f"  -> Created Application for {student_email}")
        else:
            app_id = app["_id"]
            print(f"  -> Application already exists for {student_email}")

        # 5. Create / Update Placement Rounds (Round 1: Technical, Round 2: HR)
        round1 = db.placement_rounds.find_one({"application_id": app_id, "round_number": 1})
        if not round1:
            db.placement_rounds.insert_one({
                "application_id": app_id,
                "round_number": 1,
                "round_type": "Technical",
                "notes": "DSA and React Assessment",
                "result": "scheduled",
                "scheduled_at": datetime.now(timezone.utc) + timedelta(days=2, hours=4),
                "meeting_url": "https://meet.google.com/abc-defg-hij"
            })
            print("  -> Scheduled Round 1 (Technical Interview)")

        round2 = db.placement_rounds.find_one({"application_id": app_id, "round_number": 2})
        if not round2:
            db.placement_rounds.insert_one({
                "application_id": app_id,
                "round_number": 2,
                "round_type": "HR",
                "notes": "Culture Fit & Salary Discussion",
                "result": "scheduled",
                "scheduled_at": datetime.now(timezone.utc) + timedelta(days=5, hours=2),
                "meeting_url": "https://zoom.us/j/123456789"
            })
            print("  -> Scheduled Round 2 (HR Interview)")

    print("\nDummy interview data successfully seeded for all students!")
    Database.close_db()

if __name__ == "__main__":
    seed_interviews()
