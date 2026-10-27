from fastapi import APIRouter, Depends
from app.utils.dependencies import get_current_admin
from app.database.db import get_database
from app.schemas.review import ReviewSave
from app.services import review as review_service

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])


@router.get("", dependencies=[Depends(get_current_admin)])
async def list_reviews(db=Depends(get_database)):
    return await review_service.list_reviews(db)


@router.put("/{review_id}", dependencies=[Depends(get_current_admin)])
async def save_review(review_id: str, body: ReviewSave, db=Depends(get_database)):
    return await review_service.save_review(db, review_id, body.model_dump())


@router.delete("/{review_id}", dependencies=[Depends(get_current_admin)])
async def delete_review(review_id: str, db=Depends(get_database)):
    return await review_service.delete_review(db, review_id)
