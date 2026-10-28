ORDER_CATEGORY_COLLECTION = "order_categories"

# Every website order is put in this category. It can be renamed or recoloured but never deleted.
DEFAULT_ORDER_CATEGORY_ID = "ocat-website"
DEFAULT_ORDER_CATEGORY_NAME = "Website"

# Colours the admin can pick for a category tag (Admin > Orders > Categories)
ORDER_CATEGORY_COLORS = ("emerald", "blue", "amber", "rose", "violet", "stone")


async def setup_order_category_indexes(db):
    await db[ORDER_CATEGORY_COLLECTION].create_index("id", unique=True)
