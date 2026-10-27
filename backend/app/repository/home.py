from app.models.home import HOME_COLLECTION, HOME_DOC_ID


async def get_home_content(db):
    return await db[HOME_COLLECTION].find_one({"_id": HOME_DOC_ID}, {"_id": 0})


async def insert_home_section_if_missing(db, section: str, value):
    """Sets a section only when the home document does not have it yet (never overwrites admin edits)."""
    await db[HOME_COLLECTION].update_one({"_id": HOME_DOC_ID}, {"$setOnInsert": {"_id": HOME_DOC_ID}}, upsert=True)
    await db[HOME_COLLECTION].update_one(
        {"_id": HOME_DOC_ID, section: {"$exists": False}}, {"$set": {section: value}}
    )


async def update_home_section(db, section: str, value):
    result = await db[HOME_COLLECTION].update_one(
        {"_id": HOME_DOC_ID}, {"$set": {section: value}}, upsert=True
    )
    return result.acknowledged
