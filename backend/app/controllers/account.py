from fastapi import APIRouter, Depends

from app.database.db import get_database
from app.schemas.account import AddressCreate, ProfileUpdate
from app.services import account as account_service
from app.utils.dependencies import get_current_user

# Every route here works on the logged-in customer's own account
router = APIRouter(prefix="/api/account", tags=["Customer Account"])


@router.put("/profile")
async def update_profile(body: ProfileUpdate, user=Depends(get_current_user), db=Depends(get_database)):
    return await account_service.update_profile(db, user, body.model_dump())


@router.post("/addresses")
async def add_address(body: AddressCreate, user=Depends(get_current_user), db=Depends(get_database)):
    return await account_service.add_address(db, user, body.model_dump())


@router.put("/addresses/{address_id}")
async def update_address(address_id: str, body: AddressCreate, user=Depends(get_current_user), db=Depends(get_database)):
    return await account_service.update_address(db, user, address_id, body.model_dump())


@router.delete("/addresses/{address_id}")
async def delete_address(address_id: str, user=Depends(get_current_user), db=Depends(get_database)):
    return await account_service.delete_address(db, user, address_id)


@router.put("/addresses/{address_id}/default")
async def set_default_address(address_id: str, user=Depends(get_current_user), db=Depends(get_database)):
    return await account_service.set_default_address(db, user, address_id)
