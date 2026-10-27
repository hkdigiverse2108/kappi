from fastapi import APIRouter, Depends
from app.utils.dependencies import get_current_admin
from app.database.db import get_database
from app.schemas.cart_offers import CartOffersContent
from app.services import cart_offers as cart_offers_service

router = APIRouter(prefix="/api/cart-offers", tags=["Cart Offers"])


@router.get("")
async def get_cart_offers(db=Depends(get_database)):
    return await cart_offers_service.get_cart_offers(db)


@router.put("", dependencies=[Depends(get_current_admin)])
async def save_cart_offers(body: CartOffersContent, db=Depends(get_database)):
    return await cart_offers_service.save_cart_offers(db, body.model_dump())
