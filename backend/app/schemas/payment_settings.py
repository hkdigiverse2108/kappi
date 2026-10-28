from pydantic import BaseModel, model_validator


class PaymentSettings(BaseModel):
    """Payment options shown at checkout, as set in Admin > Delivery & Payments > Payment Gateway."""
    codEnabled: bool = True
    razorpayEnabled: bool = False

    @model_validator(mode="after")
    def at_least_one(self):
        if not (self.codEnabled or self.razorpayEnabled):
            raise ValueError("Keep at least one payment option on")
        return self
