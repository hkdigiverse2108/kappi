from app.models.announcement import ANNOUNCEMENT_COLLECTION, ANNOUNCEMENT_DOC_ID


async def get_announcement_content(db):
    return await db[ANNOUNCEMENT_COLLECTION].find_one({"_id": ANNOUNCEMENT_DOC_ID}, {"_id": 0})


async def save_announcement_content(db, content: dict):
    await db[ANNOUNCEMENT_COLLECTION].replace_one({"_id": ANNOUNCEMENT_DOC_ID}, content, upsert=True)


async def insert_announcement_content_if_missing(db, content: dict):
    await db[ANNOUNCEMENT_COLLECTION].update_one(
        {"_id": ANNOUNCEMENT_DOC_ID}, {"$setOnInsert": content}, upsert=True
    )
