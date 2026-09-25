import sys
import os

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import Database

CANONICAL_COLLECTIONS = {
    "users",
    "student_profiles",
    "companies",
    "jobs",
    "applications",
    "resumes",
    "ai_analysis",
    "learning_roadmaps",
    "interviews",
    "placement_rounds",
    "placement_stats",
    "activity_logs",
    "otp_codes",
    "password_reset_tokens",
}

def clean_and_setup_db():
    print("=" * 60)
    print("PlacementAI - MongoDB Database Cleanup & Schema Setup")
    print("=" * 60)

    # 1. Connect to MongoDB
    Database.connect_db()
    db = Database.db

    if db is None:
        print("ERROR: Failed to connect to MongoDB.")
        return

    # 2. Get existing collections
    existing_collections = set(db.list_collection_names())
    print(f"\nCurrent Collections in MongoDB '{db.name}':")
    for col in sorted(existing_collections):
        print(f" - {col}")

    # 3. Identify & Drop Obsolete Collections
    obsolete = existing_collections - CANONICAL_COLLECTIONS
    if obsolete:
        print(f"\nDropping {len(obsolete)} obsolete/unwanted collections:")
        for col in sorted(obsolete):
            db.drop_collection(col)
            print(f" [DROPPED] {col}")
    else:
        print("\nNo obsolete collections found.")

    # 4. Create missing canonical collections
    print("\nEnsuring all 14 canonical collections exist:")
    for col in sorted(CANONICAL_COLLECTIONS):
        if col not in db.list_collection_names():
            db.create_collection(col)
            print(f" [CREATED] {col}")
        else:
            print(f" [EXISTS]  {col}")

    # 5. Initialize Indexes
    print("\nInitializing database indexes...")
    Database.init_indexes()

    # 6. Display Final Database State
    print("\n" + "=" * 60)
    print("FINAL DATABASE STATE (PlacementAI MongoDB)")
    print("=" * 60)
    final_collections = sorted(db.list_collection_names())
    print(f"{'Collection Name':<25} | {'Doc Count':<10} | {'Indexes':<30}")
    print("-" * 65)

    for col_name in final_collections:
        count = db[col_name].count_documents({})
        idx_info = db[col_name].index_information()
        idx_names = ", ".join(idx_info.keys())
        print(f"{col_name:<25} | {count:<10} | {idx_names}")

    print("-" * 65)
    print(f"Total Collections: {len(final_collections)} (Expected: 14)")

    Database.close_db()
    print("\nDatabase cleanup and setup completed successfully!")

if __name__ == "__main__":
    clean_and_setup_db()
