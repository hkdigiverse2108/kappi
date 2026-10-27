REVIEW_COLLECTION = "reviews"

# Only approved reviews are shown on the website (admin can set Pending / Rejected)
APPROVED_STATUS = "Approved"


async def setup_review_indexes(db):
    await db[REVIEW_COLLECTION].create_index("id", unique=True)
    await db[REVIEW_COLLECTION].create_index("productId")
