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
        """Create indices on collections (e.g. unique constraint on users.email)."""
        if cls.db is not None:
            try:
                # Unique index on email field in 'users' collection
                cls.db.users.create_index("email", unique=True)
                logger.info("Unique index on users.email verified/created.")

                # TTL index on expires_at in 'password_reset_tokens' collection
                cls.db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
                logger.info("TTL index on password_reset_tokens.expires_at verified/created.")
            except Exception as e:
                logger.error(f"Failed to initialize database indexes: {e}")

def get_db():
    """Dependency helper to get the active database."""
    if Database.db is None:
        Database.connect_db()
    return Database.db
