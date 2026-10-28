PAYMENT_SETTINGS_COLLECTION = "payment_settings"

# Which payment options the checkout shows is a single document with this _id
PAYMENT_SETTINGS_DOC_ID = "payment_settings"

# Until an admin changes it in Admin > Delivery & Payments, checkout offers only COD as before
DEFAULT_PAYMENT_SETTINGS = {
    "codEnabled": True,
    "razorpayEnabled": False,
}
