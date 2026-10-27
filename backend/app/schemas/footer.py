from pydantic import BaseModel, ConfigDict


class FooterLink(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    label: str = ""
    path: str = ""


class FooterContent(BaseModel):
    """The whole website footer, as edited from Admin > CMS: Footer."""
    model_config = ConfigDict(extra="allow")

    brandDescription: str = ""
    instagramUrl: str = ""
    facebookUrl: str = ""
    twitterUrl: str = ""
    shopHeading: str = ""
    shopLinks: list[FooterLink] = []
    companyHeading: str = ""
    companyLinks: list[FooterLink] = []
    policiesHeading: str = ""
    newsletterHeading: str = ""
    newsletterText: str = ""
    newsletterSuccessText: str = ""
    copyrightText: str = ""
