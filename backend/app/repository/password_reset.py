from app.models.password_reset import PASSWORD_RESET_COLLECTION


async def get_reset(db, email: str):
    return await db[PASSWORD_RESET_COLLECTION].find_one({"email": email}, {"_id": 0})


async def save_reset(db, email: str, reset: dict):
    await db[PASSWORD_RESET_COLLECTION].replace_one({"email": email}, {**reset, "email": email}, upsert=True)


async def update_reset(db, email: str, updates: dict):
    await db[PASSWORD_RESET_COLLECTION].update_one({"email": email}, updates)


async def delete_reset(db, email: str):
    await db[PASSWORD_RESET_COLLECTION].delete_one({"email": email})
