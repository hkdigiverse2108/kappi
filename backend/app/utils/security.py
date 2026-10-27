import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.config import settings

JWT_ALGORITHM = "HS256"

# Cookie names: customers and admins are logged in separately
USER_COOKIE = "kapee_session"
ADMIN_COOKIE = "kapee_admin_session"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


def create_token(subject: str, kind: str) -> str:
    """kind is 'user' or 'admin', so a customer token can never be used as an admin token."""
    now = datetime.now(timezone.utc)
    payload = {"sub": subject, "kind": kind, "iat": now, "exp": now + timedelta(days=settings.JWT_EXPIRE_DAYS)}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str, kind: str) -> str | None:
    """Returns the subject (user id) if the token is valid and of the expected kind."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None
    return payload.get("sub") if payload.get("kind") == kind else None


def cookie_options() -> dict:
    return {
        "httponly": True,
        "secure": settings.COOKIE_SECURE,
        "samesite": "lax",
        "max_age": settings.JWT_EXPIRE_DAYS * 24 * 60 * 60,
        "path": "/",
    }


def generate_otp() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_otp(otp: str) -> str:
    # OTPs are short-lived, a keyed hash is enough (and keeps them unreadable in the database)
    return hmac.new(settings.JWT_SECRET.encode(), otp.encode(), hashlib.sha256).hexdigest()


def otp_matches(otp: str, otp_hash: str) -> bool:
    return hmac.compare_digest(hash_otp(otp), otp_hash)
