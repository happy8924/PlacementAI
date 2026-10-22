import sys
import os
from datetime import datetime, timezone

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import Database
from app.core.security import hash_password

def bootstrap_tpo():
    Database.connect_db()
    db = Database.db
    
    if db is None:
        print("ERROR: Failed to connect to MongoDB.")
        return

    # Development defaults or environment variables
    tpo_app_id = os.getenv("DEFAULT_TPO_APP_ID", "tpo")
    tpo_email = os.getenv("DEFAULT_TPO_EMAIL", "tpo@placementai.edu")
    tpo_password = os.getenv("DEFAULT_TPO_PASSWORD", "tpo123")
    tpo_name = os.getenv("DEFAULT_TPO_NAME", "Training & Placement Officer")
    
    # Check if TPO already exists by app_id or email
    existing_tpo = db.users.find_one({"$or": [{"app_id": tpo_app_id}, {"email": tpo_email}, {"role": "tpo"}]})
    
    if existing_tpo:
        # Idempotent: ensure it has correct role, app_id, approval status
        db.users.update_one(
            {"_id": existing_tpo["_id"]},
            {"$set": {
                "role": "tpo",
                "app_id": existing_tpo.get("app_id") or tpo_app_id,
                "is_active": True,
                "is_approved": True,
                "approval_status": "approved",
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        print("=" * 60)
        print("Existing TPO account verified & updated.")
        print(f"ID / Username: {existing_tpo.get('app_id') or tpo_app_id}")
        print(f"Email: {existing_tpo.get('email')}")
        print("Role: tpo")
        print("=" * 60)
    else:
        # Insert initial bootstrap TPO user
        tpo_user = {
            "app_id": tpo_app_id,
            "name": tpo_name,
            "email": tpo_email,
            "password_hash": hash_password(tpo_password),
            "role": "tpo",
            "email_verified": True,
            "is_active": True,
            "is_approved": True,
            "approval_status": "approved",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        db.users.insert_one(tpo_user)
        print("=" * 60)
        print("Bootstrap TPO created successfully!")
        print(f"ID / Username: {tpo_app_id}")
        print(f"Email: {tpo_email}")
        print(f"Password: {tpo_password}")
        print(f"Role: tpo")
        print("=" * 60)

    Database.close_db()

if __name__ == "__main__":
    bootstrap_tpo()
