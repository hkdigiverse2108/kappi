import logging
import smtplib
from email.message import EmailMessage

from fastapi import HTTPException
from fastapi.concurrency import run_in_threadpool

from app.config import settings

logger = logging.getLogger(__name__)


def _send(to: str, subject: str, body: str, html: str | None = None):
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = f"KAPEE Enterprise <{settings.SMTP_USER}>"
    message["To"] = to
    message.set_content(body)
    if html:
        # Mail apps show the HTML version; the plain text stays as the fallback
        message.add_alternative(html, subtype="html")
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as smtp:
        smtp.starttls()
        smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        smtp.send_message(message)


async def send_email(to: str, subject: str, body: str, html: str | None = None):
    if not settings.SMTP_USER:
        # Development without SMTP settings: show the email in the backend terminal
        logger.warning(f"SMTP not configured - email to {to}:\n{subject}\n{body}")
        return
    try:
        await run_in_threadpool(_send, to, subject, body, html)
    except (smtplib.SMTPException, OSError) as e:
        # Clear message for the customer instead of a bare 500; details stay in the backend log
        logger.error(f"Could not send email to {to}: {e}")
        raise HTTPException(status_code=503, detail="We couldn't send the verification email right now. Please try again in a minute.")
