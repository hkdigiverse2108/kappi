from fastapi import APIRouter, Depends
from app.utils.dependencies import get_current_admin
from app.database.db import get_database
from app.schemas.policy import PoliciesContent
from app.services import policy as policy_service

router = APIRouter(prefix="/api/policies", tags=["Policies"])


@router.get("")
async def get_policies(db=Depends(get_database)):
    return await policy_service.get_policies(db)


@router.put("", dependencies=[Depends(get_current_admin)])
async def save_policies(body: PoliciesContent, db=Depends(get_database)):
    return await policy_service.save_policies(db, body.model_dump())
