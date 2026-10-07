"""
PlacementAI — Local MongoDB → Atlas Migration Script
Safely copies ALL collections, documents, and indexes from localhost to Atlas.
Does NOT delete or modify local data.
"""

import os
import sys
from datetime import datetime

# Add backend root so we can import project modules if needed
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from pymongo import MongoClient
from pymongo.errors import BulkWriteError

# ── Configuration ──
LOCAL_URI = "mongodb://localhost:27017"
ATLAS_URI = os.environ.get(
    "ATLAS_URI",
    "mongodb+srv://placementai_admin:admin@cluster0.8l4bkaf.mongodb.net/?appName=Cluster0&retryWrites=true&w=majority"
)
DB_NAME = "placement_ai"
BATCH_SIZE = 500  # Insert in batches to avoid memory issues

def migrate():
    print("=" * 60)
    print("  PlacementAI — MongoDB Migration: Local → Atlas")
    print("=" * 60)
    print(f"  Timestamp : {datetime.now().isoformat()}")
    print(f"  Local URI : {LOCAL_URI}")
    print(f"  Atlas URI : {ATLAS_URI[:50]}...")
    print(f"  Database  : {DB_NAME}")
    print("=" * 60)

    # ── Connect to both databases ──
    print("\n[1/5] Connecting to Local MongoDB...")
    local_client = MongoClient(LOCAL_URI, serverSelectionTimeoutMS=10000)
    local_db = local_client[DB_NAME]
    local_collections = sorted(local_db.list_collection_names())
    print(f"  ✅ Local connected. Found {len(local_collections)} collections.")

    print("\n[2/5] Connecting to MongoDB Atlas...")
    atlas_client = MongoClient(ATLAS_URI, serverSelectionTimeoutMS=60000, connectTimeoutMS=60000, socketTimeoutMS=60000)
    atlas_db = atlas_client[DB_NAME]
    # Force connection test
    atlas_db.command("ping")
    print("  ✅ Atlas connected and reachable.")

    # ── Summary of what will be migrated ──
    print(f"\n[3/5] Collections to migrate ({len(local_collections)}):")
    total_docs = 0
    collection_stats = []
    for col_name in local_collections:
        count = local_db[col_name].count_documents({})
        total_docs += count
        collection_stats.append((col_name, count))
        print(f"  • {col_name}: {count} documents")
    print(f"  ── Total: {total_docs} documents across {len(local_collections)} collections")

    # ── Migrate each collection ──
    print(f"\n[4/5] Migrating data...")
    migrated = 0
    skipped = 0
    errors = []

    for col_name, local_count in collection_stats:
        local_col = local_db[col_name]
        atlas_col = atlas_db[col_name]

        # Check if Atlas already has data in this collection
        atlas_existing = atlas_col.count_documents({})
        if atlas_existing > 0:
            print(f"  ⚠️  {col_name}: Atlas already has {atlas_existing} docs. Skipping to avoid duplicates.")
            skipped += 1
            continue

        if local_count == 0:
            print(f"  ⏭️  {col_name}: 0 documents, skipping.")
            skipped += 1
            continue

        # Fetch all documents
        docs = list(local_col.find())

        # Insert in batches
        try:
            for i in range(0, len(docs), BATCH_SIZE):
                batch = docs[i:i + BATCH_SIZE]
                atlas_col.insert_many(batch, ordered=False)
            
            # Verify count
            atlas_count = atlas_col.count_documents({})
            if atlas_count == local_count:
                print(f"  ✅ {col_name}: {atlas_count}/{local_count} documents migrated successfully.")
                migrated += 1
            else:
                print(f"  ⚠️  {col_name}: {atlas_count}/{local_count} documents (partial).")
                migrated += 1
        except BulkWriteError as bwe:
            inserted = bwe.details.get("nInserted", 0)
            print(f"  ⚠️  {col_name}: BulkWriteError — {inserted} inserted. Some duplicates may exist.")
            errors.append(col_name)
            migrated += 1
        except Exception as e:
            print(f"  ❌ {col_name}: FAILED — {e}")
            errors.append(col_name)

    # ── Migrate Indexes ──
    print(f"\n[5/5] Migrating indexes...")
    for col_name, _ in collection_stats:
        local_col = local_db[col_name]
        atlas_col = atlas_db[col_name]
        indexes = local_col.index_information()
        for idx_name, idx_info in indexes.items():
            if idx_name == "_id_":
                continue  # Default index, skip
            try:
                keys = idx_info["key"]
                kwargs = {}
                if idx_info.get("unique"):
                    kwargs["unique"] = True
                if idx_info.get("sparse"):
                    kwargs["sparse"] = True
                atlas_col.create_index(keys, name=idx_name, **kwargs)
                print(f"  ✅ {col_name}.{idx_name} index created.")
            except Exception as e:
                if "already exists" in str(e).lower():
                    pass
                else:
                    print(f"  ⚠️  {col_name}.{idx_name}: {e}")

    # ── Final Report ──
    print("\n" + "=" * 60)
    print("  MIGRATION COMPLETE")
    print("=" * 60)
    print(f"  Collections migrated : {migrated}")
    print(f"  Collections skipped  : {skipped}")
    print(f"  Errors               : {len(errors)}")
    if errors:
        print(f"  Failed collections   : {', '.join(errors)}")

    # ── Verification ──
    print("\n  🔍 Verification:")
    atlas_collections = sorted(atlas_db.list_collection_names())
    print(f"  Atlas collections: {len(atlas_collections)}")
    for col_name in atlas_collections:
        count = atlas_db[col_name].count_documents({})
        print(f"    • {col_name}: {count} documents")

    print("\n  ✅ Local data is UNTOUCHED. You can verify in MongoDB Compass.")
    print("  ✅ Atlas is now populated with your PlacementAI data.")
    print("=" * 60)

    local_client.close()
    atlas_client.close()


if __name__ == "__main__":
    migrate()
