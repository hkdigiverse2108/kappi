from app.models.admin import ADMIN_COLLECTION

PUBLIC_FIELDS = {"_id": 0, "passwordHash": 0}


async def count_admins(db) -> int:
    return await db[ADMIN_COLLECTION].count_documents({})


async def get_admin_by_email(db, email: str, with_password: bool = False):
    projection = {"_id": 0} if with_password else PUBLIC_FIELDS
    return await db[ADMIN_COLLECTION].find_one({"email": email}, projection)


async def get_admin(db, admin_id: str):
    return await db[ADMIN_COLLECTION].find_one({"id": admin_id}, PUBLIC_FIELDS)


async def create_admin(db, admin: dict):
    await db[ADMIN_COLLECTION].insert_one(dict(admin))


async def update_admin(db, admin_id: str, updates: dict):
    await db[ADMIN_COLLECTION].update_one({"id": admin_id}, {"$set": updates})
