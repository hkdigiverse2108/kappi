PRODUCT_COLLECTION = "products"

# Products with this badge are shown in the Home page "Best Sellers" section
BESTSELLER_BADGE = "Bestseller"

# Badges an admin can pick for a product (a product can have several)
PRODUCT_BADGES = [BESTSELLER_BADGE, "New Launch", "Popular"]


async def setup_product_indexes(db):
    await db[PRODUCT_COLLECTION].create_index("id", unique=True)
    await db[PRODUCT_COLLECTION].create_index("slug", unique=True)
    await db[PRODUCT_COLLECTION].create_index("category")
    await db[PRODUCT_COLLECTION].create_index("badges")
