from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.order import ORDER_STATUSES

OrderStatus = Literal[ORDER_STATUSES]


def _strip(value):
    return value.strip() if isinstance(value, str) else value


class OrderCustomer(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    phone: str = Field(min_length=10, max_length=20)
    email: EmailStr | None = None

    _clean = field_validator("name", "phone", mode="before")(_strip)

    @field_validator("email", mode="before")
    @classmethod
    def empty_email(cls, value):
        return _strip(value) or None


class OrderAddress(BaseModel):
    line1: str = Field(min_length=1, max_length=300)
    line2: str = ""
    city: str = Field(min_length=1, max_length=80)
    state: str = Field(min_length=1, max_length=80)
    pincode: str = Field(pattern=r"^\d{6}$")
    country: str = "India"

    _clean = field_validator("line1", "line2", "city", "state", "pincode", mode="before")(_strip)


class CheckoutItem(BaseModel):
    """A cart line as the website sends it; the price is looked up again from the product."""
    productId: str
    variantId: str | None = None
    quantity: int = Field(ge=1, le=100)
    isFreeGift: bool = False


class CheckoutOrder(BaseModel):
    customer: OrderCustomer
    shippingAddress: OrderAddress
    items: list[CheckoutItem] = Field(min_length=1)
    # Must be one of the options switched on in Admin > Delivery & Payments (checked in place_order)
    paymentMethod: Literal["cod", "razorpay"] = "cod"
    couponCode: str | None = None
    notes: str = Field(default="", max_length=1000)


class ManualOrderItem(BaseModel):
    productId: str = ""
    title: str = Field(min_length=1)
    variant: str = ""
    price: float = Field(ge=0)
    quantity: int = Field(ge=1)
    image: str = ""


class ManualOrder(BaseModel):
    """Order booked by an admin (phone / WhatsApp orders) from the Orders page."""
    customer: OrderCustomer
    shippingAddress: OrderAddress
    items: list[ManualOrderItem] = Field(min_length=1)
    paymentMethod: str = Field(min_length=1)
    # Order category from Admin > Orders > Categories (None = no category)
    categoryId: str | None = None
    notes: str = ""


class OrdersReadUpdate(BaseModel):
    """Marks orders read / unread in the admin notifications; ids left out = every order."""
    ids: list[str] | None = None
    read: bool = True


class OrderUpdate(BaseModel):
    """Fields the admin can change on an order; anything left out stays as it is."""
    status: OrderStatus | None = None
    paymentStatus: Literal["Pending", "Paid", "Refunded"] | None = None
    courier: str | None = None
    awb: str | None = None
    trackingUrl: str | None = None
    notes: str | None = None
    # "" removes the category
    categoryId: str | None = None
