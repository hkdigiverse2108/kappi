from fastapi import APIRouter, Depends
from app.utils.dependencies import get_current_admin
from app.database.db import get_database
from app.schemas.our_story import OurStoryContent
from app.services import our_story as our_story_service

router = APIRouter(prefix="/api/our-story", tags=["Our Story"])


@router.get("")
async def get_our_story(db=Depends(get_database)):
    return await our_story_service.get_our_story_page(db)


@router.put("", dependencies=[Depends(get_current_admin)])
async def save_our_story(body: OurStoryContent, db=Depends(get_database)):
    return await our_story_service.save_our_story_page(db, body.model_dump())
