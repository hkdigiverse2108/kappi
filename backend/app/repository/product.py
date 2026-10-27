from app.models.product import PRODUCT_COLLECTION


async def get_all_products(db):
    return await db[PRODUCT_COLLECTION].find({}, {"_id": 0}).sort("sortOrder", 1).to_list(length=None)


async def get_products_by_badge(db, badge: str):
    cursor = db[PRODUCT_COLLECTION].find({"badges": badge}, {"_id": 0}).sort("sortOrder", 1)
    return await cursor.to_list(length=None)


async def get_max_sort_order(db) -> int:
    last = await db[PRODUCT_COLLECTION].find_one({}, {"sortOrder": 1}, sort=[("sortOrder", -1)])
    return (last or {}).get("sortOrder", -1)


async def get_product_by_slug_or_id(db, key: str):
    return await db[PRODUCT_COLLECTION].find_one({"$or": [{"slug": key}, {"id": key}]}, {"_id": 0})


async def get_products_by_ids(db, product_ids: list[str]):
    """Returns the products in the same order as product_ids."""
    products = await db[PRODUCT_COLLECTION].find({"id": {"$in": product_ids}}, {"_id": 0}).to_list(length=None)
    by_id = {p["id"]: p for p in products}
    return [by_id[pid] for pid in product_ids if pid in by_id]


async def get_other_products(db, exclude_id: str, limit: int):
    cursor = db[PRODUCT_COLLECTION].find({"id": {"$ne": exclude_id}}, {"_id": 0}).sort("sortOrder", 1).limit(limit)
    return await cursor.to_list(length=limit)


async def get_product(db, product_id: str):
    return await db[PRODUCT_COLLECTION].find_one({"id": product_id}, {"_id": 0})


async def save_product(db, product_id: str, product: dict):
    """Creates the product, or replaces it if it already exists."""
    await db[PRODUCT_COLLECTION].replace_one({"id": product_id}, product, upsert=True)


async def delete_product(db, product_id: str) -> bool:
    result = await db[PRODUCT_COLLECTION].delete_one({"id": product_id})
    return result.deleted_count > 0
