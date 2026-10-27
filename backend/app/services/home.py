from fastapi import HTTPException
from app.models.home import HOME_SECTIONS
from app.models.product import BESTSELLER_BADGE
from app.repository import home as home_repo
from app.repository import product as product_repo
from app.repository import review as review_repo

# The home page is read on every visit but only changes when the admin saves, so the
# assembled response is kept in memory and cleared on every update
_home_cache: dict | None = None


def clear_cache():
    global _home_cache
    _home_cache = None


async def get_home_page(db) -> dict:
    """All home content comes from MongoDB, as saved from Admin > Homepage CMS."""
    global _home_cache
    if _home_cache is not None:
        return _home_cache

    content = await home_repo.get_home_content(db) or {}

    # Best sellers = every product whose badge is set to "Bestseller" in Admin > Products
    from app.services.product import with_review_stats  # avoids a circular import
    best_sellers = await with_review_stats(db, await product_repo.get_products_by_badge(db, BESTSELLER_BADGE))

    review_limit = (content.get("reviewsSection") or {}).get("limit") or 0
    featured_reviews = await review_repo.get_featured_reviews(db, limit=review_limit) if review_limit else []

    _home_cache = {**content, "bestSellers": best_sellers, "featuredReviews": featured_reviews}
    return _home_cache


async def update_section(db, section: str, value) -> dict:
    if section not in HOME_SECTIONS:
        raise HTTPException(status_code=404, detail=f"Unknown home section '{section}'")
    await home_repo.update_home_section(db, section, value)
    clear_cache()
    return {section: value}
