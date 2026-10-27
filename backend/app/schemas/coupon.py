from typing import Literal
from pydantic import BaseModel, ConfigDict


class CouponSave(BaseModel):
    # Same fields as the admin Offers page form; extra fields are kept as sent
    model_config = ConfigDict(extra="allow")

    code: str
    type: Literal["percentage", "flat", "free_shipping"] = "percentage"
    value: float = 0
    minCart: float = 0
    maxDiscount: float | None = None
    usedCount: int = 0
    status: str = "Active"
    # Coupons have no usage limit and no first-order-only rule: any customer can use them any number of times
    expiresAt: str | None = None
    # Products this coupon is for; empty = every product
    productIds: list[str] = []
