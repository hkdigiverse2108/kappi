from app.models.our_story import OUR_STORY_COLLECTION, OUR_STORY_DOC_ID


async def get_our_story_content(db):
    return await db[OUR_STORY_COLLECTION].find_one({"_id": OUR_STORY_DOC_ID}, {"_id": 0})


async def save_our_story_content(db, content: dict):
    await db[OUR_STORY_COLLECTION].replace_one({"_id": OUR_STORY_DOC_ID}, content, upsert=True)


async def insert_our_story_content_if_missing(db, content: dict):
    await db[OUR_STORY_COLLECTION].update_one(
        {"_id": OUR_STORY_DOC_ID}, {"$setOnInsert": content}, upsert=True
    )
