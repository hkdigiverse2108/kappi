from app.models.cart_offers import CART_OFFERS_COLLECTION, CART_OFFERS_DOC_ID


async def get_cart_offers(db):
    return await db[CART_OFFERS_COLLECTION].find_one({"_id": CART_OFFERS_DOC_ID}, {"_id": 0})


async def save_cart_offers(db, content: dict):
    await db[CART_OFFERS_COLLECTION].replace_one({"_id": CART_OFFERS_DOC_ID}, content, upsert=True)
