HOME_COLLECTION = "home_content"

# The home page content is a single document with this _id
HOME_DOC_ID = "home"

# Sections stored in the home document (keys match the frontend admin store)
HOME_SECTIONS = (
    "seo",
    "heroBanner",
    "trustSection",
    "trustPillars",
    "bestSellersSection",
    "beforeAfterSettings",
    "howItWorksHeader",
    "howItWorksSteps",
    "reviewsSection",
    "comparisonTable",
    "ugcSection",
    "homepageSections",
    # SEO of the /shop page (edited in Admin > SEO > Shop)
    "shopSeo",
)

# Starting SEO of the /shop page, added once if missing; edited in Admin > SEO > Shop
DEFAULT_SHOP_SEO = {
    "title": "Shop All Cleaning Products | KAPEE Enterprise India",
    "description": "Buy premium chemical-free magic melamine erasers, kitchen scrub pads, and home cleaning essentials online. Fast pan-India delivery & COD available.",
    "keywords": "buy magic eraser online, melamine sponge India, chemical-free cleaning products, kitchen scrub pads, bathroom tile cleaner, shoe cleaner sponge, KAPEE Enterprise shop",
    "ogTitle": "Shop All Cleaning Products | KAPEE Enterprise",
    "ogDescription": "Discover our complete range of German melamine sponges and eco cleaning heroes. Free shipping on orders over ₹499.",
    "twitterTitle": "Shop All Cleaning Products | KAPEE Enterprise",
    "twitterDescription": "Buy chemical-free magic melamine erasers and eco-friendly cleaning essentials online.",
    "ogImage": "https://kapee-enterprise.com/hero_banner.png",
}
