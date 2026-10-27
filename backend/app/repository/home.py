from app.models.home import HOME_COLLECTION, HOME_DOC_ID


async def get_home_content(db):
    return await db[HOME_COLLECTION].find_one({"_id": HOME_DOC_ID}, {"_id": 0})


async def update_home_section(db, section: str, value):
    result = await db[HOME_COLLECTION].update_one(
        {"_id": HOME_DOC_ID}, {"$set": {section: value}}, upsert=True
    )
    return result.acknowledged
