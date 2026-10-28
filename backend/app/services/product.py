from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError
from app.repository import coupon as coupon_repo
from app.repository import product as product_repo
from app.repository import review as review_repo
from app.services import home as home_service


async def with_review_stats(db, products: list[dict]) -> list[dict]:
    """Sets each product's rating and reviewCount from its approved reviews (0 when it has none),
    so these numbers are never typed in by hand."""
    stats = await review_repo.get_product_review_stats(db, [p["id"] for p in products])
    for p in products:
        p.update(stats.get(p["id"], {"rating": 0, "reviewCount": 0}))
    return products


async def list_products(db) -> list[dict]:
    return await with_review_stats(db, await product_repo.get_all_products(db))


async def _related_products(db, product: dict, field: str) -> list[dict]:
    """Only the products the admin chose in `field` (in that order); none chosen = section hidden."""
    chosen = [pid for pid in product.get(field) or [] if pid != product["id"]]
    if not chosen:
        return []
    return await with_review_stats(db, await product_repo.get_products_by_ids(db, chosen))


async def get_product_page(db, key: str) -> dict:
    """Everything the product page shows, in one response: the product (by slug or id), its approved
    reviews, active coupons, and the admin-chosen "Frequently Bought Together" and "You May Also Like" products."""
    product = await product_repo.get_product_by_slug_or_id(db, key)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product '{key}' not found")

    await with_review_stats(db, [product])
    return {
        "product": product,
        "reviews": await review_repo.get_product_reviews(db, product["id"]),
        "coupons": await coupon_repo.get_active_coupons_for_product(db, product["id"]),
        "frequentlyBoughtTogether": await _related_products(db, product, "frequentlyBoughtTogetherIds"),
        "youMayAlsoLike": await _related_products(db, product, "youMayAlsoLikeIds"),
    }


async def save_product(db, product_id: str, data: dict) -> dict:
    existing = await product_repo.get_product(db, product_id)
    # Keep the list position of existing products; new ones go to the end
    sort_order = existing["sortOrder"] if existing and "sortOrder" in existing else await product_repo.get_max_sort_order(db) + 1
    # rating / reviewCount are worked out from the reviews, never stored on the product
    data = {k: v for k, v in data.items() if k not in ("rating", "reviewCount")}
    # The admin only sets the stock on purpose (a different number than the one they loaded); any other
    # edit keeps the live stock, which orders may have lowered since
    stock_loaded = data.pop("stockLoaded", None)
    if existing and isinstance(existing.get("stock"), (int, float)):
        if stock_loaded is None or data.get("stock") == stock_loaded:
            data["stock"] = existing["stock"]
    product = {**data, "id": product_id, "sortOrder": sort_order}
    try:
        await product_repo.save_product(db, product_id, product)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail=f"Another product already uses the slug '{data.get('slug')}'")
    # The badge decides the Home page best sellers
    home_service.clear_cache()
    return product


async def delete_product(db, product_id: str):
    if not await product_repo.delete_product(db, product_id):
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found")
    home_service.clear_cache()
    return {"deleted": product_id}
