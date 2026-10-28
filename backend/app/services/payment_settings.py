from app.models.payment_settings import DEFAULT_PAYMENT_SETTINGS
from app.repository import payment_settings as payment_settings_repo


async def get_payment_settings(db) -> dict:
    return {**DEFAULT_PAYMENT_SETTINGS, **(await payment_settings_repo.get_payment_settings(db) or {})}


async def save_payment_settings(db, settings: dict) -> dict:
    await payment_settings_repo.save_payment_settings(db, settings)
    return settings


async def enabled_payment_methods(db) -> set[str]:
    """Checkout payment method keys ("cod", "razorpay") that are switched on."""
    settings = await get_payment_settings(db)
    return {key for key, on in (("cod", settings["codEnabled"]), ("razorpay", settings["razorpayEnabled"])) if on}
