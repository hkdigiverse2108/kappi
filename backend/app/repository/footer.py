from app.models.footer import FOOTER_COLLECTION, FOOTER_DOC_ID


async def get_footer_content(db):
    return await db[FOOTER_COLLECTION].find_one({"_id": FOOTER_DOC_ID}, {"_id": 0})


async def save_footer_content(db, content: dict):
    await db[FOOTER_COLLECTION].replace_one({"_id": FOOTER_DOC_ID}, content, upsert=True)


async def insert_footer_content_if_missing(db, content: dict):
    await db[FOOTER_COLLECTION].update_one(
        {"_id": FOOTER_DOC_ID}, {"$setOnInsert": content}, upsert=True
    )
