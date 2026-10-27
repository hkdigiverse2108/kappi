from pydantic import BaseModel, EmailStr, Field


class SubscribeRequest(BaseModel):
    """Email sent from the newsletter box in the website footer."""
    email: EmailStr
    source: str = Field(default="Footer Newsletter", max_length=60)
