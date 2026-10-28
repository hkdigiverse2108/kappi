from fastapi import APIRouter, Depends, Query
from app.utils.dependencies import get_current_admin, get_optional_user
from app.database.db import get_database
from app.schemas.cart_tracking import CartEventRequest, CartEventsDelete
from app.services import cart_tracking as cart_tracking_service

router = APIRouter(prefix="/api/cart-tracking", tags=["Cart Tracking"])


# Sent by the website whenever the cart changes, so no login is needed (a logged-in customer is recognised)
@router.post("/events")
async def track_cart_event(body: CartEventRequest, user=Depends(get_optional_user), db=Depends(get_database)):
    return await cart_tracking_service.track_event(db, body.model_dump(), user)


@router.get("", dependencies=[Depends(get_current_admin)])
async def cart_tracking_overview(days: int = Query(30, ge=1, le=90), db=Depends(get_database)):
    return await cart_tracking_service.get_overview(db, days)


@router.post("/bulk-delete", dependencies=[Depends(get_current_admin)])
async def bulk_delete_cart_events(body: CartEventsDelete, db=Depends(get_database)):
    return await cart_tracking_service.delete_events(db, body.ids)


@router.delete("/{event_id}", dependencies=[Depends(get_current_admin)])
async def delete_cart_event(event_id: str, db=Depends(get_database)):
    return await cart_tracking_service.delete_event(db, event_id)
