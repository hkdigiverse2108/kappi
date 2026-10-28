from app.models.payment_settings import DEFAULT_PAYMENT_SETTINGS
from app.repository import payment_settings as payment_settings_repo


async def get_payment_settings(db) -> dict:
    return {**DEFAULT_PAYMENT_SETTINGS, **(await payment_settings_repo.get_payment_settings(db) or {})}


async def save_payment_settings(db, settings: dict) -> dict:
    await payment_settings_repo.save_payment_settings(db, settings)
    return settings


def enabled_payment_methods(settings: dict) -> set[str]:
    """Checkout payment method keys ("cod", "razorpay") that are switched on."""
    return {key for key, on in (("cod", settings["codEnabled"]), ("razorpay", settings["razorpayEnabled"])) if on}


def _adjustment(rule: dict, amount: int) -> int:
    if not rule.get("enabled") or amount <= 0:
        return 0
    # Same rounding as the website cart (JavaScript Math.round)
    value = amount * rule["value"] / 100 if rule["type"] == "percent" else rule["value"]
    return int(value + 0.5)


def payment_adjustments(settings: dict, method: str, amount: int) -> tuple[int, int]:
    """(COD charge, prepaid discount) for the chosen payment method on the cart amount after other discounts."""
    if method == "cod":
        return _adjustment(settings["codCharge"], amount), 0
    return 0, min(amount, _adjustment(settings["prepaidDiscount"], amount))
