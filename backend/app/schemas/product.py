from pydantic import BaseModel, ConfigDict, Field


class ProductSave(BaseModel):
    # Products have many optional nested fields (variants, specs, how-to-use...), so only the
    # fields the backend relies on are declared and everything else is stored as sent
    model_config = ConfigDict(extra="allow")

    title: str
    slug: str
    # Units in stock, counted in pieces; 0 shows Out of Stock on the website. None = stock is not tracked.
    stock: int | None = Field(default=None, ge=0)
    # The stock the admin saw when opening the product. Orders change the stock meanwhile, so a save that
    # leaves the number as it was keeps the live stock instead of overwriting it with the old one.
    stockLoaded: int | None = Field(default=None, ge=0)
    # All selected badges; `badge` is the first one (the single pill the website shows)
    badges: list[str] = []
    badge: str = ""
    # Product ids chosen in the admin for this product page (empty = picked automatically)
    frequentlyBoughtTogetherIds: list[str] = []
    youMayAlsoLikeIds: list[str] = []
