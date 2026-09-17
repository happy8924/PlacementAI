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
        """Create indices on all 14 collections in the PlacementAI database schema."""
        if cls.db is not None:
            try:
                # 1. users collection indexes
                cls.db.users.create_index("email", unique=True)
                cls.db.users.create_index("role")

                # 2. student_profiles collection indexes
                cls.db.student_profiles.create_index("user_id", unique=True)
                cls.db.student_profiles.create_index("branch")

                # 3. companies collection indexes
                cls.db.companies.create_index("name", unique=True)
                cls.db.companies.create_index("recruiter_id")

                # 4. jobs collection indexes
                cls.db.jobs.create_index("company_id")
                cls.db.jobs.create_index("recruiter_id")
                cls.db.jobs.create_index("status")

                # 5. applications collection indexes (Prevent duplicate job_id + student_id)
                cls.db.applications.create_index([("job_id", 1), ("student_id", 1)], unique=True)
                cls.db.applications.create_index("student_id")
                cls.db.applications.create_index("status")

                # 6. resumes collection indexes
                cls.db.resumes.create_index("user_id")
                cls.db.resumes.create_index([("user_id", 1), ("is_active", 1)])

                # 7. ai_analysis collection indexes
                cls.db.ai_analysis.create_index("resume_id")
                cls.db.ai_analysis.create_index("user_id")

                # 8. learning_roadmaps collection indexes
                cls.db.learning_roadmaps.create_index("user_id")
                cls.db.learning_roadmaps.create_index("resume_id")

                # 9. interviews collection indexes
                cls.db.interviews.create_index("user_id")
                cls.db.interviews.create_index("is_completed")

                # 10. placement_rounds collection indexes
                cls.db.placement_rounds.create_index("application_id")

                # 11. placement_stats collection indexes (no specific index required)

                # 12. activity_logs collection indexes
                cls.db.activity_logs.create_index("user_id")
                cls.db.activity_logs.create_index("timestamp")

                # 13. otp_codes collection indexes (TTL auto-expiry)
                cls.db.otp_codes.create_index("email")
                cls.db.otp_codes.create_index("expires_at", expireAfterSeconds=0)

                # 14. password_reset_tokens collection indexes (TTL auto-expiry)
                cls.db.password_reset_tokens.create_index("email")
                cls.db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)

                logger.info("Successfully initialized all 14 MongoDB collection indexes.")
            except Exception as e:
                logger.error(f"Failed to initialize database indexes: {e}")

def get_db():
    """Dependency helper to get the active database."""
    if Database.db is None:
        Database.connect_db()
    return Database.db
