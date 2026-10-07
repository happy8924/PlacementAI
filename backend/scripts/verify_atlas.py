import os, sys
os.chdir(r'd:\College Files\PlacementAI\backend')
sys.path.insert(0, '.')
from dotenv import load_dotenv
load_dotenv()
from app.core.config import settings
print("URI from .env:", settings.MONGODB_URI[:55] + "...")
print("Database:", settings.MONGODB_DATABASE)

from pymongo import MongoClient
client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=60000, connectTimeoutMS=60000)
db = client[settings.MONGODB_DATABASE]
db.command("ping")
print()
print("=== READ TEST ===")
users = list(db.users.find({}, {"email": 1, "role": 1, "_id": 0}).limit(3))
for u in users:
    email = u.get("email", "?")
    role = u.get("role", "?")
    print("  User:", email, "(", role, ")")
print()
print("=== WRITE TEST ===")
from datetime import datetime, timezone
result = db.activity_logs.insert_one({"user_id": "atlas_migration_test", "action": "MIGRATION_VERIFY", "timestamp": datetime.now(timezone.utc), "details": "Atlas connection verified"})
print("  Written doc ID:", result.inserted_id)
db.activity_logs.delete_one({"_id": result.inserted_id})
print("  Test doc cleaned up.")
print()
print("ALL ATLAS OPERATIONS SUCCESSFUL!")
client.close()
