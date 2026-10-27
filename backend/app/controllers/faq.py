from fastapi import APIRouter, Depends
from app.utils.dependencies import get_current_admin
from app.database.db import get_database
from app.schemas.faq import FaqContent
from app.services import faq as faq_service

router = APIRouter(prefix="/api/faq", tags=["FAQ"])


@router.get("")
async def get_faq(db=Depends(get_database)):
    return await faq_service.get_faq_page(db)


@router.put("", dependencies=[Depends(get_current_admin)])
async def save_faq(body: FaqContent, db=Depends(get_database)):
    return await faq_service.save_faq_page(db, body.model_dump())
