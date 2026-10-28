"""Product stock: how many units of a product are left, counted in pieces (a pack of 3 uses 3)."""
from fastapi import HTTPException

from app.repository import product as product_repo
from app.services import home as home_service

# Orders in these statuses have given their stock back
STOCK_RETURNED_STATUSES = ("Cancelled", "RTO/Returned")
# Deleting an order that has not left the warehouse puts its stock back
NOT_SHIPPED_STATUSES = ("Pending", "Confirmed", "Packed")


def pieces_of(variant: dict | None) -> int:
    return max(1, int((variant or {}).get("pieces") or 1))


def _needs(items: list[dict]) -> dict[str, int]:
    """Units needed per product for the paid order lines (free gifts are not counted)."""
    needs: dict[str, int] = {}
    for item in items:
        if item.get("isFreeGift") or not item.get("productId"):
            continue
        needs[item["productId"]] = needs.get(item["productId"], 0) + item["quantity"] * int(item.get("pieces") or 1)
    return needs


def _is_tracked(stock) -> bool:
    return isinstance(stock, (int, float)) and not isinstance(stock, bool)


async def reserve(db, items: list[dict]):
    """Takes the units of a customer's order off the stock. 400 (and nothing taken) when a product is short."""
    taken: list[tuple[str, int]] = []
    try:
        for product_id, units in _needs(items).items():
            if await product_repo.reserve_stock(db, product_id, units):
                taken.append((product_id, units))
                continue
            product = await product_repo.get_product(db, product_id)
            if not product or not _is_tracked(product.get("stock")):
                continue  # not tracked: always available
            left = int(product["stock"])
            if left <= 0:
                detail = f"'{product['title']}' is out of stock. Please remove it from your cart."
            else:
                detail = f"Only {left} piece(s) of '{product['title']}' are left in stock. Please reduce the quantity."
            raise HTTPException(status_code=400, detail=detail)
    except HTTPException:
        await give_back_units(db, taken)
        raise
    if taken:
        home_service.clear_cache()


async def give_back_units(db, taken: list[tuple[str, int]]):
    for product_id, units in taken:
        await product_repo.release_stock(db, product_id, units)


async def release(db, items: list[dict]):
    """Puts the units of a cancelled / returned / deleted order back."""
    await give_back_units(db, list(_needs(items).items()))
    home_service.clear_cache()


async def take(db, items: list[dict]):
    """Takes units off without ever blocking (admin-booked orders, or a cancelled order brought back)."""
    for product_id, units in _needs(items).items():
        await product_repo.take_stock_floor(db, product_id, units)
    home_service.clear_cache()
