from app.models.user import USER_COLLECTION

# Never send the password hash outside the backend
OTP_FIELDS = ("otp", "otpAttempts", "otpSentAt", "otpExpiresAt")
PUBLIC_FIELDS = {"_id": 0, "passwordHash": 0, "phoneDigits": 0, **{f: 0 for f in OTP_FIELDS}}


async def get_user_by_email(db, email: str, with_password: bool = False):
    projection = {"_id": 0} if with_password else PUBLIC_FIELDS
    return await db[USER_COLLECTION].find_one({"email": email}, projection)


async def get_user_by_phone_digits(db, phone_digits: str):
    return await db[USER_COLLECTION].find_one({"phoneDigits": phone_digits}, PUBLIC_FIELDS)


async def get_user(db, user_id: str):
    return await db[USER_COLLECTION].find_one({"id": user_id}, PUBLIC_FIELDS)


async def list_users(db) -> list[dict]:
    return await db[USER_COLLECTION].find({}, PUBLIC_FIELDS).sort("createdAt", -1).to_list(None)


async def delete_user(db, user_id: str) -> bool:
    result = await db[USER_COLLECTION].delete_one({"id": user_id})
    return result.deleted_count > 0


async def create_user(db, user: dict):
    await db[USER_COLLECTION].insert_one(dict(user))


async def update_user(db, user_id: str, updates: dict):
    await db[USER_COLLECTION].update_one({"id": user_id}, {"$set": updates})


async def set_login_otp(db, email: str, otp_fields: dict | None):
    """Saves the pending sign-in code (otp, otpAttempts, otpSentAt, otpExpiresAt) on the user; None clears it."""
    if otp_fields is None:
        await db[USER_COLLECTION].update_one({"email": email}, {"$unset": {f: "" for f in OTP_FIELDS}})
    else:
        await db[USER_COLLECTION].update_one({"email": email}, {"$set": otp_fields})


async def add_login_otp_attempt(db, email: str):
    await db[USER_COLLECTION].update_one({"email": email}, {"$inc": {"otpAttempts": 1}})


async def set_password(db, email: str, password_hash: str):
    await db[USER_COLLECTION].update_one({"email": email}, {"$set": {"passwordHash": password_hash}})
