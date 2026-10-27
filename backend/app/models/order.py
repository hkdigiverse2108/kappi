ORDER_COLLECTION = "orders"

# Order.status values, in the order an order moves through them (admin Orders page)
ORDER_FLOW = ("Pending", "Confirmed", "Packed", "Shipped", "Out for delivery", "Delivered")
ORDER_STATUSES = ORDER_FLOW + ("Cancelled", "RTO/Returned")

# Prices include GST; the GST share is shown on the order
GST_PERCENT = 18

# Cart rewards and fees (free shipping, free gift, extra discount) are set in Admin > Offers > Cart Rewards
# (backend app/services/cart_offers.py)


async def setup_order_indexes(db):
    await db[ORDER_COLLECTION].create_index("id", unique=True)
    await db[ORDER_COLLECTION].create_index("orderNumber", unique=True)
    await db[ORDER_COLLECTION].create_index("userId")
    await db[ORDER_COLLECTION].create_index("createdAt")
