from fastapi import APIRouter, Depends
from app.utils.dependencies import get_current_admin
from app.database.db import get_database
from app.schemas.payment_settings import PaymentSettings
from app.services import payment_settings as payment_settings_service

router = APIRouter(prefix="/api/payment-settings", tags=["Payment Settings"])


@router.get("")
async def get_payment_settings(db=Depends(get_database)):
    return await payment_settings_service.get_payment_settings(db)


@router.put("", dependencies=[Depends(get_current_admin)])
async def save_payment_settings(body: PaymentSettings, db=Depends(get_database)):
    return await payment_settings_service.save_payment_settings(db, body.model_dump())
