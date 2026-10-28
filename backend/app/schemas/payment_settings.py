from typing import Literal

from pydantic import BaseModel, Field, model_validator


class PaymentAdjustment(BaseModel):
    """COD charge or prepaid discount: a percentage of the cart or a flat amount."""
    enabled: bool = False
    type: Literal["percent", "amount"] = "amount"
    value: float = Field(default=0, ge=0)

    @model_validator(mode="after")
    def percent_in_range(self):
        if self.type == "percent" and self.value > 100:
            raise ValueError("A percentage cannot be more than 100")
        return self


class PaymentSettings(BaseModel):
    """Payment options shown at checkout, as set in Admin > Delivery & Payments > Payment Gateway."""
    codEnabled: bool = True
    razorpayEnabled: bool = False
    codCharge: PaymentAdjustment = PaymentAdjustment()
    prepaidDiscount: PaymentAdjustment = PaymentAdjustment(type="percent")

    @model_validator(mode="after")
    def at_least_one(self):
        if not (self.codEnabled or self.razorpayEnabled):
            raise ValueError("Keep at least one payment option on")
        return self
