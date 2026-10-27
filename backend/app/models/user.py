USER_COLLECTION = "users"


async def setup_user_indexes(db):
    await db[USER_COLLECTION].create_index("id", unique=True)
    await db[USER_COLLECTION].create_index("email", unique=True)
    await db[USER_COLLECTION].create_index("phoneDigits")
