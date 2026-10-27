from pydantic import BaseModel, Field, model_validator


class FreeShippingReward(BaseModel):
    enabled: bool = False
    threshold: int = Field(default=0, ge=0)


class FreeGiftReward(BaseModel):
    enabled: bool = False
    threshold: int = Field(default=0, ge=0)
    # The gift is one of the shop's products (and one of its packs)
    productId: str = ""
    variantId: str | None = None

    @model_validator(mode="after")
    def gift_needs_product(self):
        if self.enabled and not self.productId:
            raise ValueError("Choose the product to give as the free gift")
        return self


class ExtraDiscountReward(BaseModel):
    enabled: bool = False
    threshold: int = Field(default=0, ge=0)
    percent: int = Field(default=0, ge=0, le=90)


class CartOffersContent(BaseModel):
    """Cart rewards shown on the cart progress bar, and the cart fees."""
    # Shipping charged when the cart is below the free shipping amount (or always, if that reward is off)
    shippingFee: int = Field(default=0, ge=0)
    giftWrapFee: int = Field(default=0, ge=0)
    freeShipping: FreeShippingReward = FreeShippingReward()
    freeGift: FreeGiftReward = FreeGiftReward()
    extraDiscount: ExtraDiscountReward = ExtraDiscountReward()
