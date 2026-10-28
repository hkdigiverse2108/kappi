# Activity log: one row for every cart change (add / change quantity / remove / clear); later changes never edit old rows
CART_EVENT_COLLECTION = "cart_events"
# Live cart: one row per visitor with what is in their cart right now
CART_SESSION_COLLECTION = "cart_sessions"


async def setup_cart_tracking_indexes(db):
    await db[CART_EVENT_COLLECTION].create_index("id", unique=True)
    await db[CART_EVENT_COLLECTION].create_index("createdAt")
    await db[CART_SESSION_COLLECTION].create_index("visitorId", unique=True)
    await db[CART_SESSION_COLLECTION].create_index("lastActivityAt")
