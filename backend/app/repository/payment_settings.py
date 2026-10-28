from app.models.payment_settings import PAYMENT_SETTINGS_COLLECTION, PAYMENT_SETTINGS_DOC_ID


async def get_payment_settings(db):
    return await db[PAYMENT_SETTINGS_COLLECTION].find_one({"_id": PAYMENT_SETTINGS_DOC_ID}, {"_id": 0})


async def save_payment_settings(db, settings: dict):
    await db[PAYMENT_SETTINGS_COLLECTION].replace_one({"_id": PAYMENT_SETTINGS_DOC_ID}, settings, upsert=True)
