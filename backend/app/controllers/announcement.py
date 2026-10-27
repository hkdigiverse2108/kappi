from fastapi import APIRouter, Depends
from app.utils.dependencies import get_current_admin
from app.database.db import get_database
from app.schemas.announcement import AnnouncementContent
from app.services import announcement as announcement_service

router = APIRouter(prefix="/api/announcement-bar", tags=["Announcement Bar"])


@router.get("")
async def get_announcement_bar(db=Depends(get_database)):
    return await announcement_service.get_announcement_bar(db)


@router.put("", dependencies=[Depends(get_current_admin)])
async def save_announcement_bar(body: AnnouncementContent, db=Depends(get_database)):
    return await announcement_service.save_announcement_bar(db, body.model_dump())
