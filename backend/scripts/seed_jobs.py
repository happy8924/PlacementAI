import sys
import os
from datetime import datetime, timedelta, timezone

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import Database

def seed_jobs():
    Database.connect_db()
    db = Database.db
    
    if db is None:
        print("ERROR: Failed to connect to MongoDB.")
        return

    # 1. Find a recruiter or admin to set as created_by
    admin = db.users.find_one({"role": "admin"})
    creator_id = str(admin["_id"]) if admin else "system_seeder"

    # Define realistic jobs
    realistic_jobs = [
        {
            "title": "Software Engineer Intern",
            "company_name": "Google",
            "location": "Bangalore / Remote",
            "job_type": "Internship",
            "description": "Join our Core Systems team for a 6-month internship focusing on scalable infrastructure and backend services.",
            "requirements": ["C++", "Python", "Data Structures", "Algorithms", "System Design"],
            "min_cgpa": 7.5,
            "eligible_branches": ["Computer Science", "Information Technology", "Mathematics and Computing"],
            "salary_package": "1.2 Lakhs/month stipend",
            "deadline": datetime.now(timezone.utc) + timedelta(days=15),
            "status": "open",
            "created_by": creator_id,
            "created_at": datetime.now(timezone.utc) - timedelta(days=2),
            "updated_at": datetime.now(timezone.utc) - timedelta(days=2)
        },
        {
            "title": "Frontend Developer (React)",
            "company_name": "Stripe",
            "location": "Remote",
            "job_type": "Full-time",
            "description": "We are looking for a frontend developer to build exceptional user experiences for our global payment platform.",
            "requirements": ["React", "TypeScript", "Tailwind CSS", "Redux", "Jest"],
            "min_cgpa": 6.5,
            "eligible_branches": ["Computer Science", "Information Technology", "MCA"],
            "salary_package": "24 - 30 LPA",
            "deadline": datetime.now(timezone.utc) + timedelta(days=30),
            "status": "open",
            "created_by": creator_id,
            "created_at": datetime.now(timezone.utc) - timedelta(days=5),
            "updated_at": datetime.now(timezone.utc) - timedelta(days=5)
        },
        {
            "title": "Data Scientist",
            "company_name": "Amazon",
            "location": "Hyderabad",
            "job_type": "Full-time",
            "description": "Build predictive models and optimize supply chain operations using machine learning.",
            "requirements": ["Python", "SQL", "Machine Learning", "TensorFlow", "Pandas"],
            "min_cgpa": 7.0,
            "eligible_branches": ["Computer Science", "Data Science", "Statistics", "Electrical Engineering"],
            "salary_package": "20 - 26 LPA",
            "deadline": datetime.now(timezone.utc) + timedelta(days=20),
            "status": "open",
            "created_by": creator_id,
            "created_at": datetime.now(timezone.utc) - timedelta(days=1),
            "updated_at": datetime.now(timezone.utc) - timedelta(days=1)
        },
        {
            "title": "Backend SDE-1",
            "company_name": "Atlassian",
            "location": "Bangalore",
            "job_type": "Full-time",
            "description": "Design and implement highly scalable microservices for Jira and Confluence.",
            "requirements": ["Java", "Spring Boot", "AWS", "Microservices", "Kafka"],
            "min_cgpa": 7.0,
            "eligible_branches": ["Computer Science", "Information Technology", "ECE"],
            "salary_package": "32 LPA + Stock Options",
            "deadline": datetime.now(timezone.utc) + timedelta(days=10),
            "status": "open",
            "created_by": creator_id,
            "created_at": datetime.now(timezone.utc) - timedelta(days=3),
            "updated_at": datetime.now(timezone.utc) - timedelta(days=3)
        }
    ]

    count = 0
    for job in realistic_jobs:
        # Check if job already exists by title and company to avoid duplicates
        existing = db.jobs.find_one({"title": job["title"], "company_name": job["company_name"]})
        if not existing:
            db.jobs.insert_one(job)
            print(f"Created Job: {job['title']} at {job['company_name']}")
            count += 1
        else:
            print(f"Job already exists: {job['title']} at {job['company_name']}")

    print(f"\nSeed completed! Added {count} new jobs.")
    Database.close_db()

if __name__ == "__main__":
    seed_jobs()
