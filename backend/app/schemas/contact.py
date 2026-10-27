from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ContactCard(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    type: Literal["whatsapp", "phone", "email", "address"] = "whatsapp"
    title: str = ""
    primaryText: str = ""
    subtext: str = ""
    actionText: str = ""
    actionUrl: str = ""
    active: bool = True


class ContactContent(BaseModel):
    """The whole contact page, as edited from Admin > CMS: Contact Us Page."""
    model_config = ConfigDict(extra="allow")

    badge: str = ""
    heading: str = ""
    subheading: str = ""
    showInquiryForm: bool = True
    cards: list[ContactCard] = []
    formTitle: str = ""
    formSubtitle: str = ""
    successTitle: str = ""
    successMessage: str = ""
    successButtonText: str = ""
    seoTitle: str = ""
    seoDescription: str = ""
    ogTitle: str = ""
    ogDescription: str = ""


class EnquiryCreate(BaseModel):
    """Message sent from the website contact form."""
    name: str = Field(min_length=1, max_length=80)
    phone: str = Field(min_length=10, max_length=20)
    email: EmailStr | None = None
    subject: str = Field(default="", max_length=120)
    message: str = Field(default="", max_length=5000)


class EnquiryStatusUpdate(BaseModel):
    # Same statuses as the admin Marketing page
    status: Literal["New", "In Progress", "Resolved"]
