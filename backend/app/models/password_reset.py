PASSWORD_RESET_COLLECTION = "password_resets"

OTP_VALID_MINUTES = 10
OTP_RESEND_SECONDS = 30
OTP_MAX_ATTEMPTS = 5


async def setup_password_reset_indexes(db):
    await db[PASSWORD_RESET_COLLECTION].create_index("email", unique=True)
    # MongoDB deletes each reset request once expiresAt has passed
    await db[PASSWORD_RESET_COLLECTION].create_index("expiresAt", expireAfterSeconds=0)
