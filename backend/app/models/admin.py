ADMIN_COLLECTION = "admins"


async def setup_admin_indexes(db):
    await db[ADMIN_COLLECTION].create_index("id", unique=True)
    await db[ADMIN_COLLECTION].create_index("email", unique=True)
