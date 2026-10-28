import uuid
from datetime import datetime, timezone

from fastapi import HTTPException

from app.models.order_category import DEFAULT_ORDER_CATEGORY_ID, DEFAULT_ORDER_CATEGORY_NAME
from app.repository import order_category as order_category_repo


async def ensure_default_order_category(db):
    """Creates the "Website" category if it is missing and puts older website orders in it."""
    if not await order_category_repo.get_category(db, DEFAULT_ORDER_CATEGORY_ID):
        # A category the admin already named "Website" must not be duplicated
        name = DEFAULT_ORDER_CATEGORY_NAME
        if await order_category_repo.get_category_by_name(db, name):
            name = f"{name} Orders"
        await order_category_repo.save_category(db, {
            "id": DEFAULT_ORDER_CATEGORY_ID,
            "name": name,
            "color": "blue",
            "isDefault": True,
            "createdAt": datetime(2000, 1, 1, tzinfo=timezone.utc).isoformat(),  # listed first
        })
    await order_category_repo.tag_untagged_website_orders(db, DEFAULT_ORDER_CATEGORY_ID)


async def list_categories(db) -> list[dict]:
    await ensure_default_order_category(db)
    categories = await order_category_repo.get_all_categories(db)
    for category in categories:
        category["orderCount"] = await order_category_repo.count_orders_in_category(db, category["id"])
    return categories


async def _check_name_free(db, name: str, category_id: str | None = None):
    existing = await order_category_repo.get_category_by_name(db, name)
    if existing and existing["id"] != category_id:
        raise HTTPException(status_code=409, detail=f"Category '{existing['name']}' already exists")


async def create_category(db, data: dict) -> dict:
    await _check_name_free(db, data["name"])
    category = {"id": f"ocat-{uuid.uuid4().hex[:10]}", **data, "createdAt": datetime.now(timezone.utc).isoformat()}
    await order_category_repo.save_category(db, category)
    return {**category, "orderCount": 0}


async def update_category(db, category_id: str, data: dict) -> dict:
    category = await order_category_repo.get_category(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    await _check_name_free(db, data["name"], category_id)
    category = {**category, **data, "isDefault": category.get("isDefault", False)}
    await order_category_repo.save_category(db, category)
    return {**category, "orderCount": await order_category_repo.count_orders_in_category(db, category_id)}


async def delete_category(db, category_id: str) -> dict:
    if category_id == DEFAULT_ORDER_CATEGORY_ID:
        raise HTTPException(status_code=400, detail="The default category cannot be deleted. You can rename it instead.")
    if not await order_category_repo.delete_category(db, category_id):
        raise HTTPException(status_code=404, detail="Category not found")
    # Orders keep existing, just without a category
    cleared = await order_category_repo.clear_category_from_orders(db, category_id)
    return {"deleted": category_id, "ordersCleared": cleared}


async def check_category(db, category_id: str | None) -> str | None:
    """The category id to store on an order ("" or None = no category); 400 when it does not exist."""
    if not category_id:
        return None
    if not await order_category_repo.get_category(db, category_id):
        raise HTTPException(status_code=400, detail="This order category no longer exists. Please choose another one.")
    return category_id
