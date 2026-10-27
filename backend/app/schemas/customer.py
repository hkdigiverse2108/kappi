from pydantic import BaseModel, EmailStr, Field


class CustomerSave(BaseModel):
    """Customer profile as edited from the admin panel."""
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    phone: str = Field(min_length=10, max_length=20)
    city: str = Field(default="", max_length=80)
    state: str = Field(default="", max_length=80)
