from app.models.our_story import DEFAULT_OUR_STORY_CONTENT
from app.repository import our_story as our_story_repo


async def ensure_our_story_content(db):
    """Fills an empty database with the starting Our Story page; never overwrites admin edits."""
    await our_story_repo.insert_our_story_content_if_missing(db, DEFAULT_OUR_STORY_CONTENT)


async def get_our_story_page(db) -> dict:
    return await our_story_repo.get_our_story_content(db) or {}


async def save_our_story_page(db, content: dict) -> dict:
    await our_story_repo.save_our_story_content(db, content)
    return content
