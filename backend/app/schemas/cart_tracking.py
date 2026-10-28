from typing import Literal

from pydantic import BaseModel, Field


class CartLine(BaseModel):
    """One product line in the visitor's cart."""
    productId: str = Field(default="", max_length=80)
    title: str = Field(max_length=200)
    variantName: str = Field(default="", max_length=120)
    price: float = Field(ge=0)
    quantity: int = Field(ge=1, le=10000)
    image: str = Field(default="", max_length=500)


class CartEventsDelete(BaseModel):
    """Entries selected in the admin Cart Tracking table."""
    ids: list[str] = Field(min_length=1, max_length=2000)


class CartEventRequest(BaseModel):
    """Sent from the website each time the cart changes."""
    visitorId: str = Field(min_length=6, max_length=64)
    action: Literal["add", "update", "remove", "clear"]
    # The line that changed (empty when the whole cart was cleared)
    line: CartLine | None = None
    # The whole cart after the change
    items: list[CartLine] = Field(default_factory=list, max_length=60)
    page: str = Field(default="", max_length=200)
