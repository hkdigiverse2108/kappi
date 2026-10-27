import logging
import uuid
from datetime import datetime, timezone

from fastapi import BackgroundTasks, HTTPException

from app.repository import newsletter as newsletter_repo
from app.utils.email import send_email
from app.utils.email_templates import newsletter_welcome

logger = logging.getLogger(__name__)

WELCOME_SUBJECT = "Welcome to the KAPEE Enterprise newsletter"


async def list_subscribers(db) -> list[dict]:
    return await newsletter_repo.get_all_subscribers(db)


async def _send_welcome_email(email: str, site: str | None = None):
    # Runs after the response is sent: a mail problem must not undo the subscription
    try:
        text, html = newsletter_welcome(site)
        await send_email(email, WELCOME_SUBJECT, text, html)
    except HTTPException:
        logger.error(f"Welcome email to {email} was not sent")


async def subscribe(db, email: str, source: str, background_tasks: BackgroundTasks, site: str | None = None) -> dict:
    # Subscribing twice with the same email is not an error: the existing row is returned
    subscriber, _ = await newsletter_repo.add_subscriber_if_new(db, {
        "id": f"sub-{uuid.uuid4().hex[:12]}",
        "email": email.strip().lower(),
        "source": source.strip() or "Footer Newsletter",
        "status": "Subscribed",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    })
    # Every subscribe sends the welcome email, also when the email was already on the list
    background_tasks.add_task(_send_welcome_email, subscriber["email"], site)
    return subscriber


async def delete_subscriber(db, subscriber_id: str):
    if not await newsletter_repo.delete_subscriber(db, subscriber_id):
        raise HTTPException(status_code=404, detail=f"Subscriber '{subscriber_id}' not found")
    return {"deleted": subscriber_id}
