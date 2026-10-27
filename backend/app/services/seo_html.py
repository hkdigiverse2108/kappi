import html
import re

# index.html ships with default SEO tags. Before a page is sent, their values are replaced with
# the SEO saved in the admin panel for that page, so crawlers that do not run JavaScript
# (WhatsApp, Facebook, Twitter, view-source) see the admin values too.
# Keep in sync with frontend/src/utils/seoTags.js (same tags, used by the dev server and browser).

# (tag attribute, attribute value, attribute that holds the text, SEO field)
SEO_TAGS = (
    ("name", "description", "content", "description"),
    ("name", "keywords", "content", "keywords"),
    ("rel", "canonical", "href", "canonicalUrl"),
    ("property", "og:url", "content", "canonicalUrl"),
    ("property", "og:title", "content", "ogTitle"),
    ("property", "og:description", "content", "ogDescription"),
    ("property", "og:image", "content", "ogImage"),
    ("name", "twitter:url", "content", "canonicalUrl"),
    ("name", "twitter:title", "content", "twitterTitle"),
    ("name", "twitter:description", "content", "twitterDescription"),
    ("name", "twitter:image", "content", "ogImage"),
)


def inject_seo(page: str, seo: dict | None) -> str:
    """seo: the resolved tags for the requested page (see services/page_seo.get_page_seo)."""
    if not seo:
        return page

    title = (seo.get("title") or "").strip()
    if title:
        page = re.sub(
            r"<title>.*?</title>",
            lambda _: f"<title>{html.escape(title, quote=False)}</title>",
            page,
            count=1,
            flags=re.S,
        )

    for attr, attr_value, target, field in SEO_TAGS:
        value = (seo.get(field) or "").strip()
        if not value:
            continue
        tag = re.compile(rf'<(?:meta|link)\b[^>]*\b{attr}="{re.escape(attr_value)}"[^>]*>')
        escaped = html.escape(value, quote=True)
        page = tag.sub(
            lambda m: re.sub(rf'\b{target}="[^"]*"', lambda _: f'{target}="{escaped}"', m.group(0), count=1),
            page,
            count=1,
        )

    return page
