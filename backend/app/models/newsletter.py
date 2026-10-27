SUBSCRIBER_COLLECTION = "newsletter_subscribers"


async def setup_subscriber_indexes(db):
    await db[SUBSCRIBER_COLLECTION].create_index("id", unique=True)
    # One row per email: subscribing again with the same email keeps the first row
    await db[SUBSCRIBER_COLLECTION].create_index("email", unique=True)
    await db[SUBSCRIBER_COLLECTION].create_index("createdAt")
