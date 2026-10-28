from pydantic import BaseModel, ConfigDict, Field


class AnnouncementMessage(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    text: str = Field(min_length=1, max_length=300)


class WhatsappPopup(BaseModel):
    """Popup shown on the website some seconds after it opens; clicking it opens WhatsApp."""
    enabled: bool = False
    image: str = ""
    # Seconds after the website opens until the popup first appears
    delaySeconds: int = Field(default=90, ge=5, le=3600)
    # Seconds after the visitor closes it until it appears again; 0 = only once per visit
    repeatSeconds: int = Field(default=0, ge=0, le=86400)


class AnnouncementContent(BaseModel):
    """The top announcement ticker, as edited from Admin > CMS: Banners & Bar."""
    model_config = ConfigDict(extra="allow")

    messages: list[AnnouncementMessage] = []
    popup: WhatsappPopup = WhatsappPopup()
