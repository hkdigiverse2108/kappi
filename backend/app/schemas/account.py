from pydantic import BaseModel, EmailStr, Field


class ProfileUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    phone: str = Field(min_length=10, max_length=20)
    dob: str = ""
    gender: str = ""


class AddressCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    type: str = "Home"
    phone: str = Field(min_length=10, max_length=20)
    addressLine1: str = Field(min_length=3, max_length=200)
    city: str = Field(min_length=2, max_length=60)
    state: str = Field(min_length=2, max_length=60)
    pincode: str = Field(pattern=r"^\d{6}$")
    isDefault: bool = False
