from fastapi import APIRouter, Depends
from app.utils.dependencies import get_current_admin
from app.database.db import get_database
from app.schemas.coupon import CouponSave
from app.services import coupon as coupon_service

router = APIRouter(prefix="/api/coupons", tags=["Coupons"])


@router.get("", dependencies=[Depends(get_current_admin)])
async def list_coupons(db=Depends(get_database)):
    return await coupon_service.list_coupons(db)


@router.get("/active")
async def list_active_coupons(db=Depends(get_database)):
    return await coupon_service.list_active_coupons(db)


@router.put("/{coupon_id}", dependencies=[Depends(get_current_admin)])
async def save_coupon(coupon_id: str, body: CouponSave, db=Depends(get_database)):
    return await coupon_service.save_coupon(db, coupon_id, body.model_dump())


@router.delete("/{coupon_id}", dependencies=[Depends(get_current_admin)])
async def delete_coupon(coupon_id: str, db=Depends(get_database)):
    return await coupon_service.delete_coupon(db, coupon_id)
