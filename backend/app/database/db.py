from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class Database:
    client: AsyncIOMotorClient = None
    db = None


db = Database()


async def connect_to_mongo():
    logger.info("Connecting to MongoDB...")
    db.client = AsyncIOMotorClient(settings.MONGO_URI)
    db.db = db.client[settings.DB_NAME]
    # Fail at startup if the URI/credentials are wrong instead of on the first request
    await db.client.admin.command("ping")
    logger.info(f"Connected to MongoDB database '{settings.DB_NAME}'")


async def close_mongo_connection():
    if db.client:
        logger.info("Closing MongoDB connection...")
        db.client.close()


def get_database():
    return db.db


def serialize_mongo_doc(data):
    """Recursively converts MongoDB ObjectId instances to strings."""
    from bson import ObjectId
    if isinstance(data, ObjectId):
        return str(data)
    if isinstance(data, dict):
        return {k: serialize_mongo_doc(v) for k, v in data.items()}
    if isinstance(data, list):
        return [serialize_mongo_doc(item) for item in data]
    return data
