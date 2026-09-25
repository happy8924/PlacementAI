import logging
from pymongo import MongoClient
from app.core.config import settings

logger = logging.getLogger(__name__)

class Database:
    client: MongoClient = None
    db = None

    @classmethod
    def connect_db(cls):
        """Establish connection to MongoDB and select database."""
        if cls.client is None:
            try:
                cls.client = MongoClient(settings.MONGODB_URI)
                cls.db = cls.client[settings.MONGODB_DATABASE]
                logger.info(f"Successfully connected to MongoDB database: {settings.MONGODB_DATABASE}")
                cls.init_indexes()
            except Exception as e:
                logger.error(f"Failed to connect to MongoDB: {e}")
                raise e

    @classmethod
    def close_db(cls):
        """Close connection to MongoDB."""
        if cls.client is not None:
            cls.client.close()
            cls.client = None
            cls.db = None
            logger.info("MongoDB connection closed.")

    @classmethod
    def init_indexes(cls):
        """Create indices on all 13 collections in the PlacementAI database schema."""
        if cls.db is not None:
            try:
                # 1. users collection indexes
                cls.db.users.create_index("email", unique=True)
                cls.db.users.create_index("role")

                # 2. otp_codes collection indexes (TTL auto-expiry)
                cls.db.otp_codes.create_index("expires_at", expireAfterSeconds=0)
                cls.db.otp_codes.create_index("email")

                # 3. password_reset_tokens collection indexes (TTL auto-expiry)
                cls.db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)

                # 4. student_profiles collection indexes
                cls.db.student_profiles.create_index("user_id", unique=True)
                cls.db.student_profiles.create_index("branch")

                # 5. companies collection indexes
                cls.db.companies.create_index("name", unique=True)
                cls.db.companies.create_index("industry")

                # 6. jobs collection indexes
                cls.db.jobs.create_index("status")
                cls.db.jobs.create_index("created_by")
                cls.db.jobs.create_index("company_name")

                # 7. applications collection indexes
                cls.db.applications.create_index([("job_id", 1), ("student_id", 1)], unique=True)
                cls.db.applications.create_index("student_id")
                cls.db.applications.create_index("status")

                # 8. placement_rounds collection indexes
                cls.db.placement_rounds.create_index([("application_id", 1), ("round_number", 1)], unique=True)
                cls.db.placement_rounds.create_index("status")

                # 9. ai_interviews collection indexes
                cls.db.ai_interviews.create_index("student_id")
                cls.db.ai_interviews.create_index("created_at")

                # 10. resume_reviews collection indexes
                cls.db.resume_reviews.create_index("student_id")
                cls.db.resume_reviews.create_index("created_at")

                # 11. placement_stats collection indexes
                cls.db.placement_stats.create_index("batch_year", unique=True)

                # 12. notifications collection indexes
                cls.db.notifications.create_index("user_id")
                cls.db.notifications.create_index("read")

                # 13. activity_logs collection indexes
                cls.db.activity_logs.create_index("user_id")
                cls.db.activity_logs.create_index("created_at")

                # 14. student_roadmaps collection indexes
                cls.db.student_roadmaps.create_index("user_id", unique=True)

                logger.info("Successfully initialized MongoDB collection indexes.")
            except Exception as e:
                logger.error(f"Failed to initialize database indexes: {e}")

def get_db():
    """Dependency helper to get the active database."""
    if Database.db is None:
        Database.connect_db()
    return Database.db
