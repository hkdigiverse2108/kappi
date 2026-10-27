from pydantic import BaseModel, ConfigDict, Field


class AnnouncementMessage(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    text: str = Field(min_length=1, max_length=300)


class AnnouncementContent(BaseModel):
    """The top announcement ticker, as edited from Admin > CMS: Banners & Bar."""
    model_config = ConfigDict(extra="allow")

    messages: list[AnnouncementMessage] = []
