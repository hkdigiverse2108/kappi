from fastapi import APIRouter, Depends
from app.utils.dependencies import get_current_admin
from app.database.db import get_database
from app.schemas.product import ProductSave
from app.services import product as product_service

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("")
async def list_products(db=Depends(get_database)):
    return await product_service.list_products(db)


@router.get("/{key}/page")
async def get_product_page(key: str, db=Depends(get_database)):
    return await product_service.get_product_page(db, key)


@router.put("/{product_id}", dependencies=[Depends(get_current_admin)])
async def save_product(product_id: str, body: ProductSave, db=Depends(get_database)):
    return await product_service.save_product(db, product_id, body.model_dump())


@router.delete("/{product_id}", dependencies=[Depends(get_current_admin)])
async def delete_product(product_id: str, db=Depends(get_database)):
    return await product_service.delete_product(db, product_id)
