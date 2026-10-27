import re
import logging
import secrets
import uuid
from datetime import datetime, timezone

from fastapi import BackgroundTasks, HTTPException
from pymongo.errors import DuplicateKeyError

from app.models.order import GST_PERCENT
from app.repository import coupon as coupon_repo
from app.repository import order as order_repo
from app.repository import product as product_repo
from app.services.cart_offers import get_cart_offers
from app.services.contact import get_contact_page
from app.utils.email import send_email
from app.utils.email_templates import order_confirmation

logger = logging.getLogger(__name__)

PAYMENT_LABELS = {"upi": "UPI", "card": "Credit/Debit Card", "cod": "Cash on Delivery (COD)"}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _round(value: float) -> int:
    # Same rounding as the website cart (JavaScript Math.round), not Python's round-half-to-even
    return int(value + 0.5)


def _shipping_fee(offers: dict, subtotal: int) -> int:
    """Shipping for a cart: free from the free-shipping amount (when that reward is on), else the shipping fee."""
    free = offers["freeShipping"]
    if subtotal == 0 or (free["enabled"] and subtotal >= free["threshold"]):
        return 0
    return offers["shippingFee"]


def _gst_included(total: float) -> int:
    """GST already inside a GST-inclusive price."""
    return _round(total * GST_PERCENT / (100 + GST_PERCENT))


async def _priced_items(db, items: list[dict]) -> list[dict]:
    """Cart lines with title, pack and price taken from the product in the database."""
    products = {p["id"]: p for p in await product_repo.get_products_by_ids(db, list({i["productId"] for i in items}))}
    priced = []
    for item in items:
        product = products.get(item["productId"])
        if not product:
            raise HTTPException(status_code=400, detail="A product in your cart is no longer available. Please remove it and try again.")
        variants = product.get("variants") or []
        variant = next((v for v in variants if v.get("id") == item.get("variantId")), None)
        if variants and not variant:
            raise HTTPException(status_code=400, detail=f"The selected pack of '{product['title']}' is no longer available.")
        price = (variant or {}).get("price", product.get("basePrice", product.get("price", 0)))
        mrp = (variant or {}).get("mrp", product.get("baseMrp", product.get("mrp", price)))
        priced.append({
            "id": f"item-{uuid.uuid4().hex[:8]}",
            "productId": product["id"],
            "variantId": (variant or {}).get("id"),
            "title": product["title"],
            "variant": (variant or {}).get("name", "Standard"),
            "price": price,
            "mrp": mrp,
            "quantity": item["quantity"],
            "image": (product.get("images") or [""])[0],
            "isFreeGift": False,
        })
    return priced


async def _coupon_discount(db, code: str | None, items: list[dict], subtotal: int, shipping_fee: int) -> tuple[str | None, int]:
    """Discount for the coupon, worked out like the website cart does."""
    if not code:
        return None, 0
    code = code.strip().upper()
    coupon = await coupon_repo.get_active_coupon_by_code(db, code)
    if not coupon:
        raise HTTPException(status_code=400, detail=f"Coupon {code} is invalid or has expired. Please remove it from your cart.")
    min_cart = float(coupon.get("minCart") or 0)
    if subtotal < min_cart:
        raise HTTPException(status_code=400, detail=f"Minimum order value for {code} is ₹{min_cart:g}")
    product_ids = coupon.get("productIds") or []
    eligible = sum(i["price"] * i["quantity"] for i in items if not product_ids or i["productId"] in product_ids)
    if not eligible:
        raise HTTPException(status_code=400, detail=f"{code} is not valid for the products in your cart")

    value = float(coupon.get("value") or 0)
    if coupon.get("type") == "percentage":
        discount = _round(eligible * value / 100)
        if coupon.get("maxDiscount"):
            discount = min(discount, int(coupon["maxDiscount"]))
    elif coupon.get("type") == "free_shipping":
        discount = shipping_fee
    else:
        discount = min(int(value), eligible)
    return code, discount


async def _new_order_number(db) -> str:
    for _ in range(10):
        # KAP- followed by 6 digits, e.g. KAP-745327
        number = f"KAP-{secrets.randbelow(900000) + 100000}"
        if not await order_repo.get_order_by_number(db, number):
            return number
    raise HTTPException(status_code=500, detail="Could not create an order number, please try again")


async def _save_new_order(db, order: dict) -> dict:
    # Two orders getting the same number at the same moment is very unlikely; retry once if it happens
    for _ in range(2):
        order["orderNumber"] = await _new_order_number(db)
        try:
            await order_repo.insert_order(db, order)
            return order
        except DuplicateKeyError:
            continue
    raise HTTPException(status_code=500, detail="Could not save the order, please try again")


async def _contact_details(db) -> dict:
    """Phone, WhatsApp and email from Admin > CMS: Contact Us Page, for the "need help?" line in order emails."""
    page = await get_contact_page(db)
    details = {}
    for card in page.get("cards", []):
        if card.get("active", True) and card.get("type") in ("phone", "whatsapp", "email") and card.get("primaryText"):
            details.setdefault(card["type"], card["primaryText"].strip())
    return details


async def _send_confirmation(order: dict, confirmed: bool = False, contact: dict | None = None):
    # Runs after the response: a mail problem must not undo the order
    if not order["customer"].get("email"):
        return
    subject = f"Order {order['orderNumber']} {'confirmed' if confirmed else 'received'} - KAPEE Enterprise"
    try:
        text, html = order_confirmation(order, confirmed, contact)
        await send_email(order["customer"]["email"], subject, text, html)
    except HTTPException:
        logger.error(f"Order email ({subject}) was not sent")


async def place_order(db, data: dict, user: dict | None, background_tasks: BackgroundTasks, site: str | None = None) -> dict:
    """Order placed from the website checkout. Prices and the total are worked out here, not taken from the browser."""
    items = await _priced_items(db, [i for i in data["items"] if not i["isFreeGift"]])
    if not items:
        raise HTTPException(status_code=400, detail="Your cart is empty")

    # Rewards and fees set in Admin > Offers > Cart Rewards
    offers = await get_cart_offers(db)
    subtotal = sum(i["price"] * i["quantity"] for i in items)
    gift = offers["freeGift"]
    if gift["enabled"] and subtotal >= gift["threshold"]:
        for gift_item in gift["items"]:
            items.append({
                "id": f"item-{uuid.uuid4().hex[:8]}",
                "price": 0,
                "quantity": 1,
                "isFreeGift": True,
                **{k: gift_item[k] for k in ("productId", "variantId", "title", "variant", "mrp", "image")},
            })
    shipping_fee = _shipping_fee(offers, subtotal)
    coupon_code, coupon_discount = await _coupon_discount(db, data.get("couponCode"), items, subtotal, shipping_fee)
    extra = offers["extraDiscount"]
    tier_discount = _round(subtotal * extra["percent"] / 100) if extra["enabled"] and subtotal >= extra["threshold"] else 0
    gift_wrap_fee = offers["giftWrapFee"] if data["giftWrap"] else 0
    total = max(0, subtotal - coupon_discount - tier_discount + shipping_fee + gift_wrap_fee)

    now = _now()
    order = {
        "id": f"ord-{uuid.uuid4().hex[:12]}",
        "orderNumber": "",
        "source": "Website",
        "userId": user["id"] if user else None,
        "customer": data["customer"],
        "shippingAddress": data["shippingAddress"],
        "items": items,
        "pricing": {
            "subtotal": subtotal,
            "couponCode": coupon_code,
            "couponDiscount": coupon_discount,
            "tierDiscount": tier_discount,
            "discount": coupon_discount + tier_discount,
            "shippingFee": shipping_fee,
            "giftWrapFee": gift_wrap_fee,
            "tax": _gst_included(total),
            "total": total,
        },
        # No payment gateway is connected yet, so every website order starts unpaid
        "payment": {"method": PAYMENT_LABELS[data["paymentMethod"]], "status": "Pending", "transactionId": None, "paidAt": None},
        "fulfillment": {"courier": "", "awb": "", "trackingUrl": "", "shippedAt": None, "deliveredAt": None},
        "status": "Pending",
        "statusHistory": [{"status": "Pending", "at": now}],
        # What the customer typed in the cart's order note; admin notes are kept apart in "notes"
        "customerNote": data.get("notes", "").strip(),
        "giftWrap": data["giftWrap"],
        "notes": "",
        # Unread in the admin bell until an admin opens it or marks it as read
        "adminRead": False,
        # Website the order was placed on; its emails link back to it
        "siteUrl": site,
        "createdAt": now,
    }
    order = await _save_new_order(db, order)
    if coupon_code:
        await coupon_repo.increment_coupon_use(db, coupon_code)
    background_tasks.add_task(_send_confirmation, order, False, await _contact_details(db))
    return order


async def create_manual_order(db, data: dict, background_tasks: BackgroundTasks, site: str | None = None) -> dict:
    """Order booked by an admin; the admin sets the prices."""
    items = [{"id": f"item-{uuid.uuid4().hex[:8]}", "isFreeGift": False, **i} for i in data["items"]]
    subtotal = _round(sum(i["price"] * i["quantity"] for i in items))
    shipping_fee = _shipping_fee(await get_cart_offers(db), subtotal)
    total = subtotal + shipping_fee
    is_cod = "COD" in data["paymentMethod"]
    now = _now()
    order = {
        "id": f"ord-{uuid.uuid4().hex[:12]}",
        "orderNumber": "",
        "source": "Admin",
        "userId": None,
        "customer": data["customer"],
        "shippingAddress": data["shippingAddress"],
        "items": items,
        "pricing": {
            "subtotal": subtotal,
            "couponCode": None,
            "couponDiscount": 0,
            "tierDiscount": 0,
            "discount": 0,
            "shippingFee": shipping_fee,
            "giftWrapFee": 0,
            "tax": _gst_included(total),
            "total": total,
        },
        "payment": {
            "method": data["paymentMethod"],
            "status": "Pending" if is_cod else "Paid",
            "transactionId": None,
            "paidAt": None if is_cod else now,
        },
        "fulfillment": {"courier": "", "awb": "", "trackingUrl": "", "shippedAt": None, "deliveredAt": None},
        "status": "Confirmed",
        "statusHistory": [{"status": "Confirmed", "at": now}],
        "notes": data.get("notes", ""),
        "adminRead": True,
        "siteUrl": site,
        "createdAt": now,
    }
    order = await _save_new_order(db, order)
    # Booked by the admin = already confirmed
    background_tasks.add_task(_send_confirmation, order, True, await _contact_details(db))
    return order


async def list_orders(db) -> list[dict]:
    return await order_repo.get_all_orders(db)


async def list_my_orders(db, user: dict) -> list[dict]:
    return await order_repo.get_orders_for_user(db, user["id"])


async def track_order(db, order_number: str) -> dict:
    """What the public Track Order page may show: no address, phone or email."""
    # "kap745327" or "KAP 745327" also find KAP-745327
    digits = re.sub(r"\D", "", order_number)
    number = f"KAP-{digits}"
    order = await order_repo.get_order_by_number(db, number)
    if not order:
        raise HTTPException(status_code=404, detail="No order found with this order ID")
    return {
        "orderNumber": order["orderNumber"],
        "status": order["status"],
        "statusHistory": order.get("statusHistory", []),
        "createdAt": order["createdAt"],
        "items": [
            {k: i.get(k) for k in ("title", "variant", "price", "quantity", "image", "isFreeGift")}
            for i in order["items"]
        ],
        "pricing": {
            k: order["pricing"].get(k)
            for k in ("subtotal", "couponCode", "couponDiscount", "tierDiscount", "shippingFee", "giftWrapFee", "total")
        },
        "payment": {"method": order["payment"]["method"]},
        "fulfillment": {k: order["fulfillment"].get(k) for k in ("courier", "awb", "trackingUrl", "shippedAt", "deliveredAt")},
    }


async def mark_orders_read(db, order_ids: list[str] | None, read: bool) -> dict:
    """Read / unread in the admin notifications; no ids = every order."""
    count = await order_repo.set_orders_read(db, order_ids, read)
    return {"updated": count}


async def update_order(db, order_id: str, data: dict, background_tasks: BackgroundTasks, site: str | None = None) -> dict:
    order = await order_repo.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")

    now = _now()
    changes = {}
    if data.get("notes") is not None:
        changes["notes"] = data["notes"]
    for field in ("courier", "awb", "trackingUrl"):
        if data.get(field) is not None:
            changes[f"fulfillment.{field}"] = data[field].strip()
    if data.get("paymentStatus"):
        changes["payment.status"] = data["paymentStatus"]
        if data["paymentStatus"] == "Paid" and not order["payment"].get("paidAt"):
            changes["payment.paidAt"] = now

    status = data.get("status")
    if status and status != order["status"]:
        changes["status"] = status
        changes["statusHistory"] = order.get("statusHistory", []) + [{"status": status, "at": now}]
        if status == "Shipped" and not order["fulfillment"].get("shippedAt"):
            changes["fulfillment.shippedAt"] = now
        if status == "Delivered":
            changes["fulfillment.deliveredAt"] = now
            # Cash on delivery is collected when the parcel is handed over
            if order["payment"]["status"] == "Pending" and not data.get("paymentStatus"):
                changes["payment.status"] = "Paid"
                changes["payment.paidAt"] = now

    if not changes:
        return order
    # Orders saved before siteUrl existed take the admin's site
    if not order.get("siteUrl") and site:
        changes["siteUrl"] = site
    updated = await order_repo.update_order(db, order_id, changes)
    # The customer gets an email when the admin confirms the order
    if changes.get("status") == "Confirmed":
        background_tasks.add_task(_send_confirmation, updated, True, await _contact_details(db))
    return updated


async def delete_order(db, order_id: str):
    if not await order_repo.delete_order(db, order_id):
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    return {"deleted": order_id}
