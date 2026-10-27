from pydantic import BaseModel, Field, model_validator


class FreeShippingReward(BaseModel):
    enabled: bool = False
    threshold: int = Field(default=0, ge=0)


class GiftChoice(BaseModel):
    # One of the shop's products (and one of its packs)
    productId: str = Field(min_length=1)
    variantId: str | None = None


class FreeGiftReward(BaseModel):
    enabled: bool = False
    threshold: int = Field(default=0, ge=0)
    # Every gift here is added to the cart for free once the cart reaches the threshold
    gifts: list[GiftChoice] = []

    @model_validator(mode="before")
    @classmethod
    def single_gift_to_list(cls, data):
        # Saved before multiple gifts existed: { productId, variantId } becomes a one-gift list
        if isinstance(data, dict) and data.get("productId") and not data.get("gifts"):
            data = {**data, "gifts": [{"productId": data["productId"], "variantId": data.get("variantId")}]}
        return data

    @model_validator(mode="after")
    def gift_needs_product(self):
        # The same product + pack only once
        unique = {}
        for gift in self.gifts:
            unique.setdefault((gift.productId, gift.variantId), gift)
        self.gifts = list(unique.values())
        if self.enabled and not self.gifts:
            raise ValueError("Choose at least one product to give as a free gift")
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
