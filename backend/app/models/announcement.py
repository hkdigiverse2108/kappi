ANNOUNCEMENT_COLLECTION = "announcement_bar"

# The website's top announcement ticker is a single document with this _id
ANNOUNCEMENT_DOC_ID = "announcement_bar"

# Saved once into an empty database so the website shows the same ticker as before;
# after that the messages are edited from Admin > CMS: Banners & Bar
DEFAULT_ANNOUNCEMENT_CONTENT = {
    "messages": [
        {"id": "msg-1", "text": "🚚 FREE Shipping across India on orders above ₹499"},
        {"id": "msg-2", "text": "✨ Multi-Item Value Combos | Save up to 50% on Bundles"},
        {"id": "msg-3", "text": "🏷️ Use coupon KAPEE10 for 10% instant checkout discount"},
        {"id": "msg-4", "text": "💵 Cash On Delivery (COD) Available across all pin codes"},
    ],
}
