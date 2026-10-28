from typing import Literal

from pydantic import BaseModel, Field, field_validator


class OrderCategorySave(BaseModel):
    """Category the admin tags orders with (e.g. Manual Order, WhatsApp, Wholesale)."""
    name: str = Field(min_length=1, max_length=40)
    color: Literal["emerald", "blue", "amber", "rose", "violet", "stone"] = "emerald"

    @field_validator("name", mode="before")
    @classmethod
    def strip_name(cls, value):
        return value.strip() if isinstance(value, str) else value
