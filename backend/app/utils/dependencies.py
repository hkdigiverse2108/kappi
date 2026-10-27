from fastapi import Depends, HTTPException, Request

from app.database.db import get_database
from app.repository import admin as admin_repo
from app.repository import user as user_repo
from app.utils.security import ADMIN_COOKIE, USER_COOKIE, decode_token


async def get_current_user(request: Request, db=Depends(get_database)) -> dict:
    """Logged-in customer (from the session cookie), or 401."""
    user_id = decode_token(request.cookies.get(USER_COOKIE, ""), kind="user")
    user = await user_repo.get_user(db, user_id) if user_id else None
    if not user:
        raise HTTPException(status_code=401, detail="Please sign in to continue")
    return user


async def get_optional_user(request: Request, db=Depends(get_database)) -> dict | None:
    """Logged-in customer, or None for a guest (e.g. guest checkout)."""
    user_id = decode_token(request.cookies.get(USER_COOKIE, ""), kind="user")
    return await user_repo.get_user(db, user_id) if user_id else None


async def get_current_admin(request: Request, db=Depends(get_database)) -> dict:
    """Logged-in admin (from the admin session cookie), or 401. Used on every admin-only API."""
    admin_id = decode_token(request.cookies.get(ADMIN_COOKIE, ""), kind="admin")
    admin = await admin_repo.get_admin(db, admin_id) if admin_id else None
    if not admin or admin.get("status", "Active") != "Active":
        raise HTTPException(status_code=401, detail="Admin login required")
    return admin
