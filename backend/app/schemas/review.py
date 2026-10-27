from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ReviewSave(BaseModel):
    # Website fields (author, date, helpful...) are the stored names; extra fields are kept as sent
    model_config = ConfigDict(extra="allow")

    # "product" = shown on its product page, "homepage" = shown only in the homepage reviews strip
    type: Literal["product", "homepage"] = "product"
    productId: str = ""
    author: str
    # Decimal ratings like 4.5 are allowed
    rating: float = Field(default=5, ge=0.5, le=5)
    comment: str = ""
    status: str = "Approved"
