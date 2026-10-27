from pydantic import BaseModel, ConfigDict


class ProductSave(BaseModel):
    # Products have many optional nested fields (variants, specs, how-to-use...), so only the
    # fields the backend relies on are declared and everything else is stored as sent
    model_config = ConfigDict(extra="allow")

    title: str
    slug: str
    # All selected badges; `badge` is the first one (the single pill the website shows)
    badges: list[str] = []
    badge: str = ""
    # Product ids chosen in the admin for this product page (empty = picked automatically)
    frequentlyBoughtTogetherIds: list[str] = []
    youMayAlsoLikeIds: list[str] = []
