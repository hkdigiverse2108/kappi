from app.repository import policy as policy_repo


async def get_policies(db) -> dict:
    # Empty until the first policy is added from Admin > CMS: Policy Pages
    content = await policy_repo.get_policies(db) or {}
    return {"policies": content.get("policies", [])}


async def save_policies(db, content: dict) -> dict:
    await policy_repo.save_policies(db, content)
    return content
