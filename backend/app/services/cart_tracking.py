import random
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException

from app.repository import cart_tracking as cart_tracking_repo

# Tracking rows older than this are removed so the collections stay small
KEEP_DAYS = 90
# A cart with no activity for this long counts as abandoned
ABANDONED_AFTER_HOURS = 1


def _total(items: list[dict]) -> float:
    return round(sum(i["price"] * i["quantity"] for i in items), 2)


async def track_event(db, body: dict, user: dict | None):
    now = datetime.now(timezone.utc).isoformat()
    items = body["items"]
    line = body["line"]
    cart = {"cartValue": _total(items), "cartCount": sum(i["quantity"] for i in items)}
    customer = {
        "userId": user["id"],
        "customerName": user.get("name") or user.get("email") or "",
        "customerEmail": user.get("email", ""),
        "customerPhone": user.get("phone", ""),
    } if user else {}

    # Every change is logged as its own row. A later remove adds a "Removed" row, it never edits or deletes the earlier "Added" row
    await cart_tracking_repo.add_event(db, {
        "id": f"cev-{uuid.uuid4().hex[:12]}",
        "visitorId": body["visitorId"],
        "action": body["action"],
        "line": line,
        "page": body["page"],
        "createdAt": now,
        "customerName": "", "customerEmail": "", "customerPhone": "",  # "Anonymous" for a guest
        **cart,
        **customer,
    })
    # Every change updates the live cart; customer details are only written for a logged-in visitor
    await cart_tracking_repo.upsert_session(db, body["visitorId"], {
        "items": items,
        "lastActivityAt": now,
        "lastAction": body["action"],
        **cart,
        **customer,
    }, now)
    # Light clean-up on a small share of requests
    if random.random() < 0.02:
        await cart_tracking_repo.delete_old(db, (datetime.now(timezone.utc) - timedelta(days=KEEP_DAYS)).isoformat())
    return {"ok": True}


async def get_overview(db, days: int) -> dict:
    now = datetime.now(timezone.utc)
    since = (now - timedelta(days=days)).isoformat()
    events = await cart_tracking_repo.get_events(db, 2000, since)
    sessions = await cart_tracking_repo.get_sessions(db, 500, since)

    cutoff = (now - timedelta(hours=ABANDONED_AFTER_HOURS)).isoformat()
    for s in sessions:
        # An emptied cart is done; a full cart idle for a while is abandoned
        if not s["items"]:
            s["status"] = "Empty"
        elif s["lastActivityAt"] < cutoff:
            s["status"] = "Abandoned"
        else:
            s["status"] = "Active"

    products: dict[str, dict] = {}
    adds = [e for e in events if e["action"] == "add" and e.get("line")]
    for e in adds:
        line = e["line"]
        row = products.setdefault(line["productId"] or line["title"], {
            "title": line["title"], "image": line["image"], "adds": 0, "quantity": 0,
        })
        row["adds"] += 1
        row["quantity"] += line["quantity"]

    abandoned = [s for s in sessions if s["status"] == "Abandoned"]
    return {
        "summary": {
            "visitors": len(sessions),
            "activeCarts": sum(1 for s in sessions if s["status"] == "Active"),
            "abandonedCarts": len(abandoned),
            "abandonedValue": round(sum(s["cartValue"] for s in abandoned), 2),
            "addToCartCount": len(adds),
        },
        "topProducts": sorted(products.values(), key=lambda r: -r["adds"])[:5],
        "carts": sessions,
        "events": events,
    }


async def delete_events(db, event_ids: list[str]):
    return {"deleted": await cart_tracking_repo.delete_events(db, event_ids)}


async def delete_event(db, event_id: str):
    if not await cart_tracking_repo.delete_event(db, event_id):
        raise HTTPException(status_code=404, detail="Cart activity not found")
    return {"deleted": event_id}
