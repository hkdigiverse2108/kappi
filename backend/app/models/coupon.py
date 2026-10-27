COUPON_COLLECTION = "coupons"

# Coupon.type values used by the admin Offers page
COUPON_TYPES = ("percentage", "flat", "free_shipping")


async def setup_coupon_indexes(db):
    await db[COUPON_COLLECTION].create_index("id", unique=True)
    await db[COUPON_COLLECTION].create_index("code", unique=True)
