from pymongo import ReturnDocument

from app.models.order import ORDER_COLLECTION


async def get_all_orders(db):
    return await db[ORDER_COLLECTION].find({}, {"_id": 0}).sort("createdAt", -1).to_list(length=None)


async def get_orders_for_user(db, user_id: str):
    cursor = db[ORDER_COLLECTION].find({"userId": user_id}, {"_id": 0}).sort("createdAt", -1)
    return await cursor.to_list(length=None)


async def get_order(db, order_id: str):
    return await db[ORDER_COLLECTION].find_one({"id": order_id}, {"_id": 0})


async def get_order_by_number(db, order_number: str):
    return await db[ORDER_COLLECTION].find_one({"orderNumber": order_number}, {"_id": 0})


async def insert_order(db, order: dict):
    # insert_one adds _id to the dict it is given, so a copy is stored
    await db[ORDER_COLLECTION].insert_one(dict(order))


async def update_order(db, order_id: str, changes: dict):
    return await db[ORDER_COLLECTION].find_one_and_update(
        {"id": order_id}, {"$set": changes}, projection={"_id": 0}, return_document=ReturnDocument.AFTER
    )


async def set_orders_read(db, order_ids: list[str] | None, read: bool) -> int:
    query = {"id": {"$in": order_ids}} if order_ids is not None else {}
    result = await db[ORDER_COLLECTION].update_many(query, {"$set": {"adminRead": read}})
    return result.modified_count


async def delete_order(db, order_id: str) -> bool:
    result = await db[ORDER_COLLECTION].delete_one({"id": order_id})
    return result.deleted_count > 0
