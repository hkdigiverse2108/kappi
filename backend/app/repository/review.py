from app.models.review import REVIEW_COLLECTION, APPROVED_STATUS


# Reviews saved before the "type" field existed count as product reviews
HOMEPAGE_TYPE = "homepage"
NOT_HOMEPAGE = {"$ne": HOMEPAGE_TYPE}


async def get_featured_reviews(db, limit: int = 8):
    """Homepage strip: the homepage reviews; while none exist, approved product reviews fill it."""
    for query in ({"type": HOMEPAGE_TYPE}, {"type": NOT_HOMEPAGE}):
        cursor = db[REVIEW_COLLECTION].find({**query, "status": APPROVED_STATUS}, {"_id": 0}).sort("sortOrder", 1).limit(limit)
        reviews = await cursor.to_list(length=limit)
        if reviews:
            return reviews
    return []


async def get_product_reviews(db, product_id: str):
    query = {"productId": product_id, "type": NOT_HOMEPAGE, "status": APPROVED_STATUS}
    cursor = db[REVIEW_COLLECTION].find(query, {"_id": 0}).sort("sortOrder", 1)
    return await cursor.to_list(length=None)


async def get_product_review_stats(db, product_ids: list[str]) -> dict[str, dict]:
    """{productId: {"rating": average, "reviewCount": n}} from the approved product reviews."""
    pipeline = [
        {"$match": {"productId": {"$in": product_ids}, "type": NOT_HOMEPAGE, "status": APPROVED_STATUS}},
        {"$group": {"_id": "$productId", "rating": {"$avg": "$rating"}, "reviewCount": {"$sum": 1}}},
    ]
    rows = await db[REVIEW_COLLECTION].aggregate(pipeline).to_list(length=None)
    return {r["_id"]: {"rating": round(r["rating"] or 0, 1), "reviewCount": r["reviewCount"]} for r in rows}


async def get_all_reviews(db):
    return await db[REVIEW_COLLECTION].find({}, {"_id": 0}).sort("sortOrder", 1).to_list(length=None)


async def get_review(db, review_id: str):
    return await db[REVIEW_COLLECTION].find_one({"id": review_id}, {"_id": 0})


async def get_min_sort_order(db) -> int:
    first = await db[REVIEW_COLLECTION].find_one({}, {"sortOrder": 1}, sort=[("sortOrder", 1)])
    return (first or {}).get("sortOrder", 0)


async def save_review(db, review_id: str, review: dict):
    await db[REVIEW_COLLECTION].replace_one({"id": review_id}, review, upsert=True)


async def delete_review(db, review_id: str) -> bool:
    result = await db[REVIEW_COLLECTION].delete_one({"id": review_id})
    return result.deleted_count > 0
