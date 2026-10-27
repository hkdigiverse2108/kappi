from fastapi import HTTPException

from app.repository import cart_offers as cart_offers_repo
from app.repository import product as product_repo
from app.schemas.cart_offers import CartOffersContent


async def _gift_item(db, gift: dict) -> dict | None:
    """Title, pack, image and MRP of the gift product, as the cart and the order show it."""
    if not gift.get("productId"):
        return None
    product = await product_repo.get_product(db, gift["productId"])
    if not product:
        return None
    variants = product.get("variants") or []
    variant = next((v for v in variants if v.get("id") == gift.get("variantId")), None) or (variants[0] if variants else None)
    return {
        "productId": product["id"],
        "variantId": (variant or {}).get("id"),
        "slug": product.get("slug", ""),
        "title": product["title"],
        "variant": (variant or {}).get("name", "Standard"),
        "mrp": (variant or {}).get("mrp", product.get("baseMrp", product.get("mrp", 0))),
        "image": (product.get("images") or [""])[0],
    }


async def get_cart_offers(db) -> dict:
    # All rewards off and no fees until they are set from Admin > Offers > Cart Rewards
    content = CartOffersContent(**(await cart_offers_repo.get_cart_offers(db) or {})).model_dump()
    gift = content["freeGift"]
    # Gifts whose product was deleted are not offered
    items = [await _gift_item(db, g) for g in gift["gifts"]] if gift["enabled"] else []
    gift["items"] = [item for item in items if item]
    if gift["enabled"] and not gift["items"]:
        gift["enabled"] = False
    return content


async def save_cart_offers(db, content: dict) -> dict:
    gift = content["freeGift"]
    for choice in gift["gifts"] if gift["enabled"] else []:
        if not await product_repo.get_product(db, choice["productId"]):
            raise HTTPException(status_code=400, detail="A free gift product no longer exists. Please choose another one.")
    await cart_offers_repo.save_cart_offers(db, content)
    return await get_cart_offers(db)
