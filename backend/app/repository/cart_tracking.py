from app.models.cart_tracking import CART_EVENT_COLLECTION, CART_SESSION_COLLECTION


async def add_event(db, event: dict):
    await db[CART_EVENT_COLLECTION].insert_one(event)


async def upsert_session(db, visitor_id: str, session: dict, first_seen_at: str):
    await db[CART_SESSION_COLLECTION].update_one(
        {"visitorId": visitor_id},
        {"$set": session, "$setOnInsert": {"firstSeenAt": first_seen_at}},
        upsert=True,
    )


async def get_events(db, limit: int, since: str) -> list[dict]:
    return await db[CART_EVENT_COLLECTION].find(
        {"createdAt": {"$gte": since}}, {"_id": 0}
    ).sort("createdAt", -1).to_list(length=limit)


async def get_sessions(db, limit: int, since: str) -> list[dict]:
    return await db[CART_SESSION_COLLECTION].find(
        {"lastActivityAt": {"$gte": since}}, {"_id": 0}
    ).sort("lastActivityAt", -1).to_list(length=limit)


async def delete_event(db, event_id: str) -> bool:
    result = await db[CART_EVENT_COLLECTION].delete_one({"id": event_id})
    return result.deleted_count > 0


async def delete_events(db, event_ids: list[str]) -> int:
    result = await db[CART_EVENT_COLLECTION].delete_many({"id": {"$in": event_ids}})
    return result.deleted_count


async def delete_old(db, before: str):
    await db[CART_EVENT_COLLECTION].delete_many({"createdAt": {"$lt": before}})
    await db[CART_SESSION_COLLECTION].delete_many({"lastActivityAt": {"$lt": before}})
