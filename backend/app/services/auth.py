import re
import secrets
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError

from app.models.password_reset import OTP_MAX_ATTEMPTS, OTP_RESEND_SECONDS, OTP_VALID_MINUTES
from app.repository import password_reset as reset_repo
from app.repository import user as user_repo
from app.utils.email import send_email
from app.utils.security import generate_otp, hash_otp, hash_password, otp_matches, verify_password

GENERIC_OTP_MESSAGE = "If an account exists for this email or mobile, a 6-digit code has been sent to its email."


def phone_digits(phone: str) -> str:
    """Last 10 digits, so '+91 98450 12345' and '9845012345' match."""
    return re.sub(r"\D", "", phone or "")[-10:]


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _as_utc(value: datetime) -> datetime:
    # MongoDB returns naive UTC datetimes
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


# ---------------------------------------------------------------- register / login

async def register(db, data: dict) -> dict:
    email = data["email"].lower()
    digits = phone_digits(data["phone"])
    if len(digits) != 10:
        raise HTTPException(status_code=422, detail="Please enter a valid 10-digit mobile number")
    if await user_repo.get_user_by_email(db, email):
        raise HTTPException(status_code=409, detail="An account with this email already exists. Please sign in.")
    if await user_repo.get_user_by_phone_digits(db, digits):
        raise HTTPException(status_code=409, detail="An account with this mobile number already exists. Please sign in.")

    user = {
        "id": f"usr-{uuid.uuid4().hex[:12]}",
        "name": data["name"].strip(),
        "email": email,
        "phone": data["phone"].strip(),
        "phoneDigits": digits,
        "passwordHash": hash_password(data["password"]),
        "dob": "",
        "gender": "",
        "avatar": "",
        "addresses": [],
        "memberSince": _now().strftime("%B %Y"),
        "createdAt": _now(),
    }
    try:
        await user_repo.create_user(db, user)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="An account with this email already exists. Please sign in.")
    # No session yet: the customer signs in (password + email OTP) after registering
    return {"message": "Account created. Please sign in to continue."}


async def login(db, email: str, password: str) -> dict:
    """Checks the password, then emails a one-time code. The session starts in verify_login_otp."""
    user = await user_repo.get_user_by_email(db, email.lower(), with_password=True)
    if not user or not verify_password(password, user.get("passwordHash", "")):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    if user.get("otpSentAt"):
        wait = OTP_RESEND_SECONDS - int((_now() - _as_utc(user["otpSentAt"])).total_seconds())
        if wait > 0:
            raise HTTPException(status_code=429, detail=f"Please wait {wait} seconds before requesting a new code")

    # The pending code is kept as plain fields on the user document
    otp = generate_otp()
    await user_repo.set_login_otp(db, user["email"], {
        "otp": otp,
        "otpAttempts": 0,
        "otpSentAt": _now(),
        "otpExpiresAt": _now() + timedelta(minutes=OTP_VALID_MINUTES),
    })
    try:
        await send_email(
            user["email"],
            "Your KAPEE sign-in code",
            f"Hi {user['name']},\n\nYour KAPEE sign-in code is: {otp}\n\n"
            f"It is valid for {OTP_VALID_MINUTES} minutes. If you did not try to sign in, please change your password.\n",
        )
    except HTTPException:
        # Not sent, so allow an immediate retry
        await user_repo.set_login_otp(db, user["email"], None)
        raise
    return {"otpRequired": True, "message": f"A 6-digit code has been sent to {user['email']}"}


async def verify_login_otp(db, email: str, otp: str) -> dict:
    email = email.lower()
    user = await user_repo.get_user_by_email(db, email, with_password=True)
    if not user or not user.get("otp") or _as_utc(user["otpExpiresAt"]) < _now():
        raise HTTPException(status_code=400, detail="This code has expired. Please sign in again.")
    attempts = user.get("otpAttempts", 0)
    if attempts >= OTP_MAX_ATTEMPTS:
        raise HTTPException(status_code=429, detail="Too many wrong attempts. Please request a new code.")
    if not secrets.compare_digest(otp, user["otp"]):
        await user_repo.add_login_otp_attempt(db, email)
        left = OTP_MAX_ATTEMPTS - attempts - 1
        raise HTTPException(status_code=400, detail=f"Incorrect code. {left} attempt(s) left.")

    # Code used up
    await user_repo.set_login_otp(db, email, None)
    return await user_repo.get_user(db, user["id"])


# ---------------------------------------------------------------- forgot password (email OTP)

async def _find_user_by_identifier(db, identifier: str):
    identifier = identifier.strip()
    if "@" in identifier:
        return await user_repo.get_user_by_email(db, identifier.lower())
    digits = phone_digits(identifier)
    return await user_repo.get_user_by_phone_digits(db, digits) if len(digits) == 10 else None


async def send_reset_otp(db, identifier: str) -> dict:
    user = await _find_user_by_identifier(db, identifier)
    # Same answer whether or not the account exists, so nobody can check which emails are registered
    if not user:
        return {"message": GENERIC_OTP_MESSAGE}

    existing = await reset_repo.get_reset(db, user["email"])
    if existing and existing.get("lastSentAt"):
        wait = OTP_RESEND_SECONDS - int((_now() - _as_utc(existing["lastSentAt"])).total_seconds())
        if wait > 0:
            raise HTTPException(status_code=429, detail=f"Please wait {wait} seconds before requesting a new code")

    otp = generate_otp()
    await reset_repo.save_reset(db, user["email"], {
        "otpHash": hash_otp(otp),
        "attempts": 0,
        "resetTokenHash": None,
        "lastSentAt": _now(),
        "expiresAt": _now() + timedelta(minutes=OTP_VALID_MINUTES),
    })
    try:
        await send_email(
            user["email"],
            "Your KAPEE password reset code",
            f"Hi {user['name']},\n\nYour KAPEE password reset code is: {otp}\n\n"
            f"It is valid for {OTP_VALID_MINUTES} minutes. If you did not ask to reset your password, you can ignore this email.\n",
        )
    except HTTPException:
        # Not sent, so allow an immediate retry
        await reset_repo.delete_reset(db, user["email"])
        raise
    return {"message": GENERIC_OTP_MESSAGE}


async def _get_valid_reset(db, identifier: str):
    user = await _find_user_by_identifier(db, identifier)
    reset = await reset_repo.get_reset(db, user["email"]) if user else None
    if not reset or _as_utc(reset["expiresAt"]) < _now():
        raise HTTPException(status_code=400, detail="This code has expired. Please request a new one.")
    return user, reset


async def verify_reset_otp(db, identifier: str, otp: str) -> dict:
    user, reset = await _get_valid_reset(db, identifier)
    if reset["attempts"] >= OTP_MAX_ATTEMPTS:
        raise HTTPException(status_code=429, detail="Too many wrong attempts. Please request a new code.")
    if not reset.get("otpHash") or not otp_matches(otp, reset["otpHash"]):
        await reset_repo.update_reset(db, user["email"], {"$inc": {"attempts": 1}})
        left = OTP_MAX_ATTEMPTS - reset["attempts"] - 1
        raise HTTPException(status_code=400, detail=f"Incorrect code. {left} attempt(s) left.")

    # The OTP is used up; a one-time token allows setting the new password
    reset_token = secrets.token_urlsafe(32)
    await reset_repo.update_reset(db, user["email"], {"$set": {"otpHash": None, "resetTokenHash": hash_otp(reset_token)}})
    return {"resetToken": reset_token}


async def reset_password(db, identifier: str, reset_token: str, password: str) -> dict:
    user, reset = await _get_valid_reset(db, identifier)
    if not reset.get("resetTokenHash") or not otp_matches(reset_token, reset["resetTokenHash"]):
        raise HTTPException(status_code=400, detail="Please verify the code again.")
    await user_repo.set_password(db, user["email"], hash_password(password))
    await reset_repo.delete_reset(db, user["email"])
    return {"message": "Password updated. You can now sign in."}
