import re

from app.models.order import ORDER_COLLECTION
from app.models.order_category import ORDER_CATEGORY_COLLECTION


async def get_all_categories(db):
    return await db[ORDER_CATEGORY_COLLECTION].find({}, {"_id": 0}).sort("createdAt", 1).to_list(length=None)


async def get_category(db, category_id: str):
    return await db[ORDER_CATEGORY_COLLECTION].find_one({"id": category_id}, {"_id": 0})


async def get_category_by_name(db, name: str):
    # Names are unique ignoring case ("Manual Order" = "manual order")
    return await db[ORDER_CATEGORY_COLLECTION].find_one(
        {"name": {"$regex": f"^{re.escape(name)}$", "$options": "i"}}, {"_id": 0}
    )


async def save_category(db, category: dict):
    await db[ORDER_CATEGORY_COLLECTION].replace_one({"id": category["id"]}, category, upsert=True)


async def delete_category(db, category_id: str) -> bool:
    result = await db[ORDER_CATEGORY_COLLECTION].delete_one({"id": category_id})
    return result.deleted_count > 0


async def tag_untagged_website_orders(db, category_id: str) -> int:
    """Website orders placed before categories existed (no categoryId field at all) join the default category.
    Orders whose category the admin cleared on purpose (categoryId null) are left alone."""
    result = await db[ORDER_COLLECTION].update_many(
        {"source": "Website", "categoryId": {"$exists": False}}, {"$set": {"categoryId": category_id}}
    )
    return result.modified_count


async def count_orders_in_category(db, category_id: str) -> int:
    return await db[ORDER_COLLECTION].count_documents({"categoryId": category_id})


async def clear_category_from_orders(db, category_id: str) -> int:
    result = await db[ORDER_COLLECTION].update_many({"categoryId": category_id}, {"$set": {"categoryId": None}})
    return result.modified_count
