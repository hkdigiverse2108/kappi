from fastapi import APIRouter, Depends
from app.utils.dependencies import get_current_admin
from app.database.db import get_database
from app.schemas.order_category import OrderCategorySave
from app.services import order_category as order_category_service

router = APIRouter(prefix="/api/order-categories", tags=["Order Categories"], dependencies=[Depends(get_current_admin)])


@router.get("")
async def list_order_categories(db=Depends(get_database)):
    return await order_category_service.list_categories(db)


@router.post("")
async def create_order_category(body: OrderCategorySave, db=Depends(get_database)):
    return await order_category_service.create_category(db, body.model_dump())


@router.put("/{category_id}")
async def update_order_category(category_id: str, body: OrderCategorySave, db=Depends(get_database)):
    return await order_category_service.update_category(db, category_id, body.model_dump())


@router.delete("/{category_id}")
async def delete_order_category(category_id: str, db=Depends(get_database)):
    return await order_category_service.delete_category(db, category_id)
