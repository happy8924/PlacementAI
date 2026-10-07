import sys
import os
from datetime import datetime, timezone

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import Database
from app.core.security import hash_password

def create_admin():
    Database.connect_db()
    db = Database.db
    
    if db is None:
        print("ERROR: Failed to connect to MongoDB.")
        return

    admin_email = "admin@gmail.com"
    admin_password = "admin123"
    
    # Check if admin already exists and delete if so to recreate with correct schema
    db.users.delete_one({"email": admin_email})

    # Insert admin user
    admin_user = {
        "name": "System Administrator",
        "email": admin_email,
        "password_hash": hash_password(admin_password),
        "role": "admin",
        "email_verified": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    db.users.insert_one(admin_user)
    print("=" * 60)
    print("Admin user created successfully!")
    print(f"Email: {admin_email}")
    print(f"Password: {admin_password}")
    print("=" * 60)

    Database.close_db()

if __name__ == "__main__":
    create_admin()
