from fastapi import APIRouter, Depends
from app.utils.dependencies import get_current_admin
from app.database.db import get_database
from app.schemas.home import HomeResponse, HomeSectionUpdate
from app.services import home as home_service

router = APIRouter(prefix="/api/home", tags=["Home"])


@router.get("", response_model=HomeResponse)
async def get_home(db=Depends(get_database)):
    return await home_service.get_home_page(db)


@router.put("/{section}", dependencies=[Depends(get_current_admin)])
async def update_home_section(section: str, body: HomeSectionUpdate, db=Depends(get_database)):
    return await home_service.update_section(db, section, body.value)
