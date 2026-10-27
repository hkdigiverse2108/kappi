from fastapi import HTTPException
from app.repository import review as review_repo
from app.services import home as home_service


async def list_reviews(db) -> list[dict]:
    return await review_repo.get_all_reviews(db)


async def save_review(db, review_id: str, data: dict) -> dict:
    existing = await review_repo.get_review(db, review_id)
    # New reviews go to the top of the list
    sort_order = existing["sortOrder"] if existing and "sortOrder" in existing else await review_repo.get_min_sort_order(db) - 1
    review = {**data, "id": review_id, "sortOrder": sort_order}
    await review_repo.save_review(db, review_id, review)
    # Home page shows featured reviews
    home_service.clear_cache()
    return review


async def delete_review(db, review_id: str):
    if not await review_repo.delete_review(db, review_id):
        raise HTTPException(status_code=404, detail=f"Review '{review_id}' not found")
    home_service.clear_cache()
    return {"deleted": review_id}
