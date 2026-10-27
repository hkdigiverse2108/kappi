import re
from app.models.home import DEFAULT_SHOP_SEO
from app.repository import contact as contact_repo
from app.repository import faq as faq_repo
from app.repository import our_story as our_story_repo
from app.repository import policy as policy_repo
from app.repository import product as product_repo
from app.services import home as home_service

# Shop page title/description used if they are emptied in Admin > SEO > Shop
SHOP_SEO_DEFAULT = {key: DEFAULT_SHOP_SEO[key] for key in ("title", "description")}


def _clean(value) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def _summary(text: str, limit: int = 160) -> str:
    text = _clean(text)
    return text if len(text) <= limit else text[: limit - 1].rsplit(" ", 1)[0] + "…"


def _site_url(home_seo: dict) -> str:
    return (_clean(home_seo.get("canonicalUrl")) or _clean(home_seo.get("storeUrl")) or "").rstrip("/")


def _absolute(site: str, url: str) -> str:
    url = _clean(url)
    if not url or url.startswith(("http://", "https://")) or not site:
        return url
    return f"{site}/{url.lstrip('/')}"


def _from_cms(content: dict | None) -> dict:
    """Our Story, Contact and FAQ pages store seoTitle / seoDescription / seoKeywords / ogTitle /
    ogDescription / twitterTitle / twitterDescription / ogImage (edited in Admin > SEO)."""
    content = content or {}
    return {
        "title": content.get("seoTitle"),
        "description": content.get("seoDescription"),
        "keywords": content.get("seoKeywords"),
        "ogTitle": content.get("ogTitle"),
        "ogDescription": content.get("ogDescription"),
        "twitterTitle": content.get("twitterTitle"),
        "twitterDescription": content.get("twitterDescription"),
        "ogImage": content.get("ogImage"),
    }


async def _page_values(db, path: str, home: dict, site: str) -> dict | None:
    """SEO saved in the admin panel for one website page, or None for pages without their own SEO."""
    if path == "/":
        return home.get("seo") or {}
    if path == "/about":
        return _from_cms(await our_story_repo.get_our_story_content(db))
    if path == "/contact":
        return _from_cms(await contact_repo.get_contact_content(db))
    if path in ("/faqs", "/faq"):
        return _from_cms(await faq_repo.get_faq_content(db))
    if path == "/shop":
        page = dict(home.get("shopSeo") or {})
        for key, default in SHOP_SEO_DEFAULT.items():
            page[key] = _clean(page.get(key)) or default
        return page

    match = re.fullmatch(r"/products?/([^/]+)", path)
    if match:
        product = await product_repo.get_product_by_slug_or_id(db, match.group(1))
        if not product:
            return None
        title = _clean(product.get("title"))
        subtitle = _clean(product.get("subtitle"))
        images = product.get("images") or []
        return {
            "title": f"{title} | Buy Online at Best Price ₹{product.get('basePrice')} | KAPEE Enterprise",
            "description": _summary(f"{subtitle} Free delivery & COD available across India."),
            "ogTitle": f"{title} | KAPEE Enterprise",
            "ogDescription": subtitle,
            "ogImage": _absolute(site, images[0]) if images else "",
            "canonicalUrl": f"{site}/product/{product.get('slug')}" if site else "",
        }

    match = re.fullmatch(r"/policies/([^/]+)", path)
    if match:
        doc = await policy_repo.get_policies(db) or {}
        policy = next((p for p in doc.get("policies", []) if p.get("slug") == match.group(1)), None)
        if not policy:
            return None
        first_section = next((s.get("content") for s in policy.get("sections", []) if s.get("content")), "")
        return {
            "title": f"{_clean(policy.get('title'))} | KAPEE Enterprise",
            "description": _summary(first_section) if first_section else "",
        }

    return None


async def get_page_seo(db, path: str) -> dict:
    """
    SEO tags for a website URL. Pages with their own admin SEO get those values; every
    field left empty falls back to the homepage SEO (Admin > SEO > Home).
    "matched" is False for pages without their own SEO (cart, account, ...).
    """
    path = "/" + path.split("?", 1)[0].split("#", 1)[0].strip("/")
    home = await home_service.get_home_page(db)
    home_seo = home.get("seo") or {}
    site = _site_url(home_seo)

    page = await _page_values(db, path, home, site)
    matched = page is not None
    page = {key: _clean(value) for key, value in (page or {}).items()}

    title = page.get("title") or _clean(home_seo.get("title"))
    description = page.get("description") or _clean(home_seo.get("description"))
    og_title = page.get("ogTitle") or page.get("title") or _clean(home_seo.get("ogTitle")) or title
    og_description = (
        page.get("ogDescription") or page.get("description") or _clean(home_seo.get("ogDescription")) or description
    )
    seo = {
        "title": title,
        "description": description,
        "keywords": page.get("keywords") or _clean(home_seo.get("keywords")),
        "canonicalUrl": page.get("canonicalUrl") or (f"{site}{path}" if site and path != "/" else _clean(home_seo.get("canonicalUrl"))),
        "ogTitle": og_title,
        "ogDescription": og_description,
        "ogImage": _absolute(site, page.get("ogImage") or home_seo.get("ogImage")),
        "twitterTitle": page.get("twitterTitle") or (og_title if page.get("ogTitle") or page.get("title") else _clean(home_seo.get("twitterTitle")) or og_title),
        "twitterDescription": page.get("twitterDescription") or (
            og_description if page.get("ogDescription") or page.get("description") else _clean(home_seo.get("twitterDescription")) or og_description
        ),
    }
    return {"matched": matched, "seo": seo}
