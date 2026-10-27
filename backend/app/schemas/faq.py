from pydantic import BaseModel, ConfigDict, Field


class FaqItem(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    category: str = ""
    question: str = Field(min_length=1)
    answer: str = Field(min_length=1)
    published: bool = True


class FaqContent(BaseModel):
    """The whole FAQ page, as edited from Admin > FAQ."""
    model_config = ConfigDict(extra="allow")

    badge: str = ""
    heading: str = ""
    subheading: str = ""
    searchPlaceholder: str = ""
    helpTitle: str = ""
    helpText: str = ""
    seoTitle: str = ""
    seoDescription: str = ""
    seoKeywords: str = ""
    ogTitle: str = ""
    ogDescription: str = ""
    twitterTitle: str = ""
    twitterDescription: str = ""
    ogImage: str = ""
    categories: list[str] = []
    faqs: list[FaqItem] = []
