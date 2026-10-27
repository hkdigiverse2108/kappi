from app.models.faq import FAQ_COLLECTION, FAQ_DOC_ID


async def get_faq_content(db):
    return await db[FAQ_COLLECTION].find_one({"_id": FAQ_DOC_ID}, {"_id": 0})


async def save_faq_content(db, content: dict):
    await db[FAQ_COLLECTION].replace_one({"_id": FAQ_DOC_ID}, content, upsert=True)
