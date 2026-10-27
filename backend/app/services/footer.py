from app.models.footer import DEFAULT_FOOTER_CONTENT
from app.repository import footer as footer_repo


async def ensure_footer_content(db):
    """Fills an empty database with the starting footer; never overwrites admin edits."""
    await footer_repo.insert_footer_content_if_missing(db, DEFAULT_FOOTER_CONTENT)


async def get_footer(db) -> dict:
    return await footer_repo.get_footer_content(db) or {}


async def save_footer(db, content: dict) -> dict:
    await footer_repo.save_footer_content(db, content)
    return content
