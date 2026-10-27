from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError
from app.repository import coupon as coupon_repo


async def list_coupons(db) -> list[dict]:
    return await coupon_repo.get_all_coupons(db)


async def list_active_coupons(db) -> list[dict]:
    return await coupon_repo.get_active_coupons(db)


async def save_coupon(db, coupon_id: str, data: dict) -> dict:
    # No usage limit / first-order-only rules any more (older coupons may still send them)
    data = {k: v for k, v in data.items() if k not in ("usageLimit", "firstOrderOnly")}
    coupon = {**data, "id": coupon_id, "code": data["code"].strip().upper()}
    try:
        await coupon_repo.save_coupon(db, coupon_id, coupon)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail=f"Coupon code '{coupon['code']}' already exists")
    return coupon


async def delete_coupon(db, coupon_id: str):
    if not await coupon_repo.delete_coupon(db, coupon_id):
        raise HTTPException(status_code=404, detail=f"Coupon '{coupon_id}' not found")
    return {"deleted": coupon_id}
