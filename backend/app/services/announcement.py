from app.models.announcement import DEFAULT_ANNOUNCEMENT_CONTENT
from app.repository import announcement as announcement_repo


async def ensure_announcement_content(db):
    """Fills an empty database with the starting ticker messages; never overwrites admin edits."""
    await announcement_repo.insert_announcement_content_if_missing(db, DEFAULT_ANNOUNCEMENT_CONTENT)


async def get_announcement_bar(db) -> dict:
    return await announcement_repo.get_announcement_content(db) or {"messages": []}


async def save_announcement_bar(db, content: dict) -> dict:
    await announcement_repo.save_announcement_content(db, content)
    return content
