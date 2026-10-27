from fastapi import APIRouter, Depends
from app.database.db import get_database
from app.services import page_seo as page_seo_service

router = APIRouter(prefix="/api/seo", tags=["SEO"])


@router.get("")
async def get_page_seo(path: str = "/", db=Depends(get_database)):
    """SEO tags of one website page, as saved in the admin panel."""
    return await page_seo_service.get_page_seo(db, path)
