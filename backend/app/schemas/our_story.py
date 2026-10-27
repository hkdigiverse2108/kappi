from typing import Literal
from pydantic import BaseModel, ConfigDict


class StoryPillar(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    icon: Literal["Leaf", "ShieldCheck", "Heart", "Sparkles", "Zap", "Droplets", "Star", "Truck"] = "Leaf"
    title: str = ""
    desc: str = ""
    active: bool = True


class OurStoryContent(BaseModel):
    """The whole Our Story page, as edited from Admin > CMS: Our Story Page."""
    model_config = ConfigDict(extra="allow")

    heroBadge: str = ""
    heroTitle: str = ""
    heroSubtext: str = ""
    storyHeading: str = ""
    storyParagraph1: str = ""
    storyParagraph2: str = ""
    storyParagraph3: str = ""
    storyImage: str = ""
    storyImageAlt: str = ""
    valuesHeading: str = ""
    valuesSubtext: str = ""
    values: list[StoryPillar] = []
    ctaHeading: str = ""
    ctaSubtext: str = ""
    ctaButtonText: str = ""
    ctaButtonLink: str = ""
    seoTitle: str = ""
    seoDescription: str = ""
    ogTitle: str = ""
    ogDescription: str = ""
