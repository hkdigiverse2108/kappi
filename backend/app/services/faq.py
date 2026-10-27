from app.repository import faq as faq_repo


async def get_faq_page(db) -> dict:
    # Empty until the first save from Admin > FAQ
    return await faq_repo.get_faq_content(db) or {"categories": [], "faqs": []}


async def save_faq_page(db, content: dict) -> dict:
    # Every question's category is kept in the category list, so no question disappears from the tabs
    categories = [c.strip() for c in content.get("categories", []) if c.strip()]
    for faq in content.get("faqs", []):
        faq["category"] = faq.get("category", "").strip() or (categories[0] if categories else "General")
        if faq["category"] not in categories:
            categories.append(faq["category"])
    content["categories"] = list(dict.fromkeys(categories))
    await faq_repo.save_faq_content(db, content)
    return content
