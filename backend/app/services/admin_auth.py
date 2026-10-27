import logging
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException

from app.config import settings
from app.repository import admin as admin_repo
from app.utils.security import hash_password, verify_password

logger = logging.getLogger(__name__)


async def ensure_first_admin(db):
    """Keeps the Super Admin in sync with ADMIN_EMAIL / ADMIN_PASSWORD in .env (runs on every startup).

    The admin is created if missing, and its password is reset to the .env value whenever they differ,
    so the .env password always works after a restart.
    """
    if not settings.ADMIN_EMAIL or not settings.ADMIN_PASSWORD:
        if await admin_repo.count_admins(db) == 0:
            logger.warning("No admin account exists. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env and restart the backend.")
        return

    email = settings.ADMIN_EMAIL.lower()
    existing = await admin_repo.get_admin_by_email(db, email, with_password=True)
    if existing:
        updates = {}
        if not verify_password(settings.ADMIN_PASSWORD, existing.get("passwordHash", "")):
            updates["passwordHash"] = hash_password(settings.ADMIN_PASSWORD)
        # The name shown in the admin panel also follows ADMIN_NAME in .env
        if settings.ADMIN_NAME and existing.get("name") != settings.ADMIN_NAME:
            updates["name"] = settings.ADMIN_NAME
        if updates:
            await admin_repo.update_admin(db, existing["id"], updates)
            logger.info(f"Admin {email} updated from .env ({', '.join(updates)})")
        return

    await admin_repo.create_admin(db, {
        "id": f"adm-{uuid.uuid4().hex[:12]}",
        "name": settings.ADMIN_NAME,
        "email": settings.ADMIN_EMAIL.lower(),
        "role": "Super Admin",
        "status": "Active",
        "avatar": "",
        "phone": "",
        "passwordHash": hash_password(settings.ADMIN_PASSWORD),
        "lastLogin": None,
    })
    logger.info(f"Created first admin account {settings.ADMIN_EMAIL}")


async def login(db, email: str, password: str) -> dict:
    admin = await admin_repo.get_admin_by_email(db, email.lower(), with_password=True)
    if not admin or not verify_password(password, admin.get("passwordHash", "")):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if admin.get("status", "Active") != "Active":
        raise HTTPException(status_code=403, detail="This admin account is disabled")
    await admin_repo.update_admin(db, admin["id"], {"lastLogin": datetime.now(timezone.utc)})
    return await admin_repo.get_admin(db, admin["id"])
