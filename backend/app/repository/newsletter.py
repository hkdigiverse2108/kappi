from app.models.newsletter import SUBSCRIBER_COLLECTION


async def get_all_subscribers(db):
    return await db[SUBSCRIBER_COLLECTION].find({}, {"_id": 0}).sort("createdAt", -1).to_list(length=None)


async def add_subscriber_if_new(db, subscriber: dict) -> tuple[dict, bool]:
    """Inserts the subscriber unless the email is already on the list.

    Returns the stored row and whether it was just added.
    """
    result = await db[SUBSCRIBER_COLLECTION].update_one(
        {"email": subscriber["email"]}, {"$setOnInsert": subscriber}, upsert=True
    )
    stored = await db[SUBSCRIBER_COLLECTION].find_one({"email": subscriber["email"]}, {"_id": 0})
    return stored, result.upserted_id is not None


async def delete_subscriber(db, subscriber_id: str) -> bool:
    result = await db[SUBSCRIBER_COLLECTION].delete_one({"id": subscriber_id})
    return result.deleted_count > 0
