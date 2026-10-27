import uuid
from datetime import datetime, timezone

from fastapi import HTTPException

from app.models.contact import DEFAULT_CONTACT_CONTENT
from app.repository import contact as contact_repo


async def ensure_contact_content(db):
    """Fills an empty database with the starting contact page; never overwrites admin edits."""
    await contact_repo.insert_contact_content_if_missing(db, DEFAULT_CONTACT_CONTENT)


async def get_contact_page(db) -> dict:
    return await contact_repo.get_contact_content(db) or {}


async def save_contact_page(db, content: dict) -> dict:
    await contact_repo.save_contact_content(db, content)
    return content


async def list_enquiries(db) -> list[dict]:
    return await contact_repo.get_all_enquiries(db)


async def create_enquiry(db, data: dict) -> dict:
    enquiry = {
        # email is None when the customer leaves it empty
        **{k: (v or "").strip() for k, v in data.items()},
        "id": f"enq-{uuid.uuid4().hex[:12]}",
        "status": "New",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    await contact_repo.create_enquiry(db, enquiry)
    return enquiry


async def update_enquiry_status(db, enquiry_id: str, status: str) -> dict:
    enquiry = await contact_repo.update_enquiry(db, enquiry_id, {"status": status})
    if not enquiry:
        raise HTTPException(status_code=404, detail=f"Enquiry '{enquiry_id}' not found")
    return enquiry


async def delete_enquiry(db, enquiry_id: str):
    if not await contact_repo.delete_enquiry(db, enquiry_id):
        raise HTTPException(status_code=404, detail=f"Enquiry '{enquiry_id}' not found")
    return {"deleted": enquiry_id}
