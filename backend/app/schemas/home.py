from typing import Any
from pydantic import BaseModel


class HomeResponse(BaseModel):
    seo: dict | None = None
    heroBanner: dict | None = None
    trustSection: dict | None = None
    trustPillars: list[dict] = []
    bestSellersSection: dict | None = None
    beforeAfterSettings: dict | None = None
    howItWorksHeader: dict | None = None
    howItWorksSteps: list[dict] = []
    reviewsSection: dict | None = None
    comparisonTable: dict | None = None
    ugcSection: dict | None = None
    homepageSections: list[dict] = []
    shopSeo: dict | None = None
    bestSellers: list[dict] = []
    featuredReviews: list[dict] = []


class HomeSectionUpdate(BaseModel):
    # Whole new value of the section (object or list, same shape as in GET /api/home)
    value: Any
