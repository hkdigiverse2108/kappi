from urllib.parse import urlsplit

from fastapi import Request

from app.config import settings


def site_base_url(request: Request) -> str:
    """Address of the website the request came from, for links in emails.

    The browser sends it in the Origin (or Referer) header, so the links follow the site automatically:
    http://localhost:5173 while developing, https://<live domain> once the site is live.
    Only the site in FRONTEND_URL, or the domain this backend itself is reached on (website and /api on the
    same domain), is trusted - anything else falls back to FRONTEND_URL, so a request with a made-up Origin
    can't put someone else's link into an email.
    """
    fallback = settings.FRONTEND_URL.rstrip("/")
    sent = request.headers.get("origin") or request.headers.get("referer") or ""
    parts = urlsplit(sent)
    if parts.scheme not in ("http", "https") or not parts.netloc:
        return fallback
    origin = f"{parts.scheme}://{parts.netloc}"

    served_on = {request.headers.get("x-forwarded-host"), request.headers.get("host")}
    if origin == fallback or parts.netloc in served_on:
        return origin
    return fallback
