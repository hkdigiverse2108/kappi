from fastapi import APIRouter, BackgroundTasks, Depends, Request

from app.database.db import get_database
from app.schemas.order import CheckoutOrder, ManualOrder, OrdersReadUpdate, OrderUpdate
from app.services import order as order_service
from app.utils.dependencies import get_current_admin, get_current_user, get_optional_user
from app.utils.site import site_base_url

router = APIRouter(prefix="/api/orders", tags=["Orders"])


# Website: checkout (guests too; a signed-in customer's order is linked to their account)
@router.post("")
async def place_order(
    body: CheckoutOrder,
    request: Request,
    background_tasks: BackgroundTasks,
    user=Depends(get_optional_user),
    db=Depends(get_database),
):
    return await order_service.place_order(db, body.model_dump(), user, background_tasks, site_base_url(request))


# Website: the signed-in customer's own orders (My Account)
@router.get("/mine")
async def my_orders(user=Depends(get_current_user), db=Depends(get_database)):
    return await order_service.list_my_orders(db, user)


# Website: Track Order page and the order success page
@router.get("/track/{order_number}")
async def track_order(order_number: str, db=Depends(get_database)):
    return await order_service.track_order(db, order_number)


# Admin: Orders page
@router.get("", dependencies=[Depends(get_current_admin)])
async def list_orders(db=Depends(get_database)):
    return await order_service.list_orders(db)


@router.post("/manual", dependencies=[Depends(get_current_admin)])
async def create_manual_order(body: ManualOrder, request: Request, background_tasks: BackgroundTasks, db=Depends(get_database)):
    return await order_service.create_manual_order(db, body.model_dump(), background_tasks, site_base_url(request))


# Admin notifications: mark orders read / unread
@router.post("/read", dependencies=[Depends(get_current_admin)])
async def mark_orders_read(body: OrdersReadUpdate, db=Depends(get_database)):
    return await order_service.mark_orders_read(db, body.ids, body.read)


@router.patch("/{order_id}", dependencies=[Depends(get_current_admin)])
async def update_order(order_id: str, body: OrderUpdate, request: Request, background_tasks: BackgroundTasks, db=Depends(get_database)):
    return await order_service.update_order(db, order_id, body.model_dump(), background_tasks, site_base_url(request))


@router.delete("/{order_id}", dependencies=[Depends(get_current_admin)])
async def delete_order(order_id: str, db=Depends(get_database)):
    return await order_service.delete_order(db, order_id)
