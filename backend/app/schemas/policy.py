from pydantic import BaseModel, Field, field_validator


class PolicySection(BaseModel):
    id: str = Field(min_length=1)
    title: str = Field(min_length=1)
    content: str = Field(min_length=1)


class PolicyDocument(BaseModel):
    # Website address of the page: /policies/<slug>
    slug: str = Field(min_length=1, max_length=60, pattern=r"^[a-z0-9]+(-[a-z0-9]+)*$")
    title: str = Field(min_length=1)
    # Link text in the website footer's Policies column; empty = not in the footer
    footerLabel: str = ""
    lastUpdated: str = ""
    sections: list[PolicySection] = []


class PoliciesContent(BaseModel):
    """Every policy page, in the order shown in the footer and the "Other Policies" list."""
    policies: list[PolicyDocument] = []

    @field_validator("policies")
    @classmethod
    def unique_slugs(cls, policies: list[PolicyDocument]):
        slugs = [p.slug for p in policies]
        duplicate = next((s for s in slugs if slugs.count(s) > 1), None)
        if duplicate:
            raise ValueError(f"Two policies use the same page address '/policies/{duplicate}'")
        return policies
