from fastapi import APIRouter, Depends

from app.database.db import get_database
from app.schemas.customer import CustomerSave
from app.services import customer as customer_service
from app.utils.dependencies import get_current_admin

# Registered website customers, managed from the admin panel
router = APIRouter(prefix="/api/admin/customers", tags=["Admin Customers"], dependencies=[Depends(get_current_admin)])


@router.get("")
async def list_customers(db=Depends(get_database)):
    return await customer_service.list_customers(db)


@router.post("")
async def create_customer(body: CustomerSave, db=Depends(get_database)):
    return await customer_service.create_customer(db, body.model_dump())


@router.put("/{customer_id}")
async def update_customer(customer_id: str, body: CustomerSave, db=Depends(get_database)):
    return await customer_service.update_customer(db, customer_id, body.model_dump())


@router.delete("/{customer_id}")
async def delete_customer(customer_id: str, db=Depends(get_database)):
    return await customer_service.delete_customer(db, customer_id)
