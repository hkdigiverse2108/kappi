import uuid
from datetime import datetime, timezone

from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError

from app.repository import user as user_repo
from app.services.auth import phone_digits


def _to_customer(user: dict) -> dict:
    """Registered user -> row for the admin Customers page."""
    addresses = user.get("addresses") or []
    default = next((a for a in addresses if a.get("isDefault")), addresses[0] if addresses else {})
    created = user.get("createdAt")
    return {
        "id": user["id"],
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "phone": user.get("phone", ""),
        # City / state set by the admin win, otherwise the customer's default address
        "city": user.get("city") or default.get("city", ""),
        "state": user.get("state") or default.get("state", ""),
        "addresses": addresses,
        # Orders are not stored in the backend yet
        "totalOrders": 0,
        "totalSpent": 0,
        "rewardsPoints": 0,
        "segment": "New Customer",
        "status": user.get("status", "Active"),
        "createdAt": created.isoformat() if isinstance(created, datetime) else created,
    }


async def _check_unique(db, email: str, digits: str, user_id: str | None = None):
    other = await user_repo.get_user_by_email(db, email)
    if other and other["id"] != user_id:
        raise HTTPException(status_code=409, detail="Another account already uses this email")
    other = await user_repo.get_user_by_phone_digits(db, digits)
    if other and other["id"] != user_id:
        raise HTTPException(status_code=409, detail="Another account already uses this mobile number")


def _valid_digits(phone: str) -> str:
    digits = phone_digits(phone)
    if len(digits) != 10:
        raise HTTPException(status_code=422, detail="Please enter a valid 10-digit mobile number")
    return digits


async def list_customers(db) -> list[dict]:
    return [_to_customer(u) for u in await user_repo.list_users(db)]


async def create_customer(db, data: dict) -> dict:
    email = data["email"].lower()
    digits = _valid_digits(data["phone"])
    await _check_unique(db, email, digits)

    now = datetime.now(timezone.utc)
    user = {
        "id": f"usr-{uuid.uuid4().hex[:12]}",
        "name": data["name"].strip(),
        "email": email,
        "phone": data["phone"].strip(),
        "phoneDigits": digits,
        # No password yet: the customer sets one with "Forgot password"
        "passwordHash": "",
        "dob": "",
        "gender": "",
        "avatar": "",
        "addresses": [],
        "city": data.get("city", "").strip(),
        "state": data.get("state", "").strip(),
        "memberSince": now.strftime("%B %Y"),
        "createdAt": now,
    }
    try:
        await user_repo.create_user(db, user)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Another account already uses this email")
    return _to_customer(await user_repo.get_user(db, user["id"]))


async def update_customer(db, user_id: str, data: dict) -> dict:
    if not await user_repo.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="Customer not found")
    email = data["email"].lower()
    digits = _valid_digits(data["phone"])
    await _check_unique(db, email, digits, user_id)

    await user_repo.update_user(db, user_id, {
        "name": data["name"].strip(),
        "email": email,
        "phone": data["phone"].strip(),
        "phoneDigits": digits,
        "city": data.get("city", "").strip(),
        "state": data.get("state", "").strip(),
    })
    return _to_customer(await user_repo.get_user(db, user_id))


async def delete_customer(db, user_id: str) -> dict:
    if not await user_repo.delete_user(db, user_id):
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deleted"}
