import uuid

from fastapi import HTTPException

from app.repository import user as user_repo
from app.services.auth import phone_digits


async def update_profile(db, user: dict, data: dict) -> dict:
    email = data["email"].lower()
    digits = phone_digits(data["phone"])
    if len(digits) != 10:
        raise HTTPException(status_code=422, detail="Please enter a valid 10-digit mobile number")
    if email != user["email"] and await user_repo.get_user_by_email(db, email):
        raise HTTPException(status_code=409, detail="Another account already uses this email")
    other = await user_repo.get_user_by_phone_digits(db, digits)
    if other and other["id"] != user["id"]:
        raise HTTPException(status_code=409, detail="Another account already uses this mobile number")

    await user_repo.update_user(db, user["id"], {
        "name": data["name"].strip(),
        "email": email,
        "phone": data["phone"].strip(),
        "phoneDigits": digits,
        "dob": data.get("dob", ""),
        "gender": data.get("gender", ""),
    })
    return await user_repo.get_user(db, user["id"])


async def _save_addresses(db, user: dict, addresses: list[dict]) -> dict:
    # Exactly one default address when there is at least one address
    if addresses and not any(a.get("isDefault") for a in addresses):
        addresses[0]["isDefault"] = True
    await user_repo.update_user(db, user["id"], {"addresses": addresses})
    return await user_repo.get_user(db, user["id"])


async def add_address(db, user: dict, data: dict) -> dict:
    addresses = [dict(a) for a in user.get("addresses", [])]
    if data.get("isDefault"):
        for a in addresses:
            a["isDefault"] = False
    addresses.append({**data, "id": f"addr-{uuid.uuid4().hex[:10]}"})
    return await _save_addresses(db, user, addresses)


async def update_address(db, user: dict, address_id: str, data: dict) -> dict:
    addresses = [dict(a) for a in user.get("addresses", [])]
    target = next((a for a in addresses if a["id"] == address_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Address not found")
    # Default flag is changed only through set_default_address
    target.update({k: v for k, v in data.items() if k != "isDefault"})
    return await _save_addresses(db, user, addresses)


async def delete_address(db, user: dict, address_id: str) -> dict:
    addresses = [a for a in user.get("addresses", []) if a["id"] != address_id]
    if len(addresses) == len(user.get("addresses", [])):
        raise HTTPException(status_code=404, detail="Address not found")
    return await _save_addresses(db, user, addresses)


async def set_default_address(db, user: dict, address_id: str) -> dict:
    if not any(a["id"] == address_id for a in user.get("addresses", [])):
        raise HTTPException(status_code=404, detail="Address not found")
    addresses = [{**a, "isDefault": a["id"] == address_id} for a in user.get("addresses", [])]
    return await _save_addresses(db, user, addresses)
