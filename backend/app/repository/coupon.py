from datetime import date
from app.models.coupon import COUPON_COLLECTION


async def get_all_coupons(db):
    return await db[COUPON_COLLECTION].find({}, {"_id": 0}).to_list(length=None)


def _active_query() -> dict:
    """Coupons with status Active whose expiry date has not passed (expiresAt is YYYY-MM-DD)."""
    today = date.today().isoformat()
    return {"status": "Active", "$or": [{"expiresAt": {"$gte": today}}, {"expiresAt": {"$in": [None, ""]}}]}


async def get_active_coupons(db):
    return await db[COUPON_COLLECTION].find(_active_query(), {"_id": 0}).to_list(length=None)


async def get_active_coupons_for_product(db, product_id: str):
    """Only the active coupons whose selected products include this product."""
    query = {**_active_query(), "productIds": product_id}
    return await db[COUPON_COLLECTION].find(query, {"_id": 0}).to_list(length=None)


async def get_coupon(db, coupon_id: str):
    return await db[COUPON_COLLECTION].find_one({"id": coupon_id}, {"_id": 0})


async def save_coupon(db, coupon_id: str, coupon: dict):
    await db[COUPON_COLLECTION].replace_one({"id": coupon_id}, coupon, upsert=True)


async def delete_coupon(db, coupon_id: str) -> bool:
    result = await db[COUPON_COLLECTION].delete_one({"id": coupon_id})
    return result.deleted_count > 0


async def get_active_coupon_by_code(db, code: str):
    return await db[COUPON_COLLECTION].find_one({**_active_query(), "code": code}, {"_id": 0})


async def increment_coupon_use(db, code: str):
    await db[COUPON_COLLECTION].update_one({"code": code}, {"$inc": {"usedCount": 1}})
