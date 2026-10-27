from app.models.policy import POLICY_COLLECTION, POLICY_DOC_ID


async def get_policies(db):
    return await db[POLICY_COLLECTION].find_one({"_id": POLICY_DOC_ID}, {"_id": 0})


async def save_policies(db, content: dict):
    await db[POLICY_COLLECTION].replace_one({"_id": POLICY_DOC_ID}, content, upsert=True)
