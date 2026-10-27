from fastapi import APIRouter, Depends
from app.utils.dependencies import get_current_admin
from app.database.db import get_database
from app.schemas.footer import FooterContent
from app.services import footer as footer_service

router = APIRouter(prefix="/api/footer", tags=["Footer"])


@router.get("")
async def get_footer(db=Depends(get_database)):
    return await footer_service.get_footer(db)


@router.put("", dependencies=[Depends(get_current_admin)])
async def save_footer(body: FooterContent, db=Depends(get_database)):
    return await footer_service.save_footer(db, body.model_dump())
