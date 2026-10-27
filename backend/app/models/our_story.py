OUR_STORY_COLLECTION = "our_story_content"

# The Our Story (/about) page content is a single document with this _id
OUR_STORY_DOC_ID = "our_story"

# Icons the website can draw for a brand pillar (lucide-react names, see pages/About.jsx)
PILLAR_ICONS = ("Leaf", "ShieldCheck", "Heart", "Sparkles", "Zap", "Droplets", "Star", "Truck")

# Saved once into an empty database so the website shows the same Our Story page as before;
# after that everything is edited from Admin > CMS: Our Story Page
DEFAULT_OUR_STORY_CONTENT = {
    "heroBadge": "Our Mission",
    "heroTitle": "Cleaner Solutions, Brighter Living.",
    "heroSubtext": "We started KAPEE Enterprise with one simple conviction: Indian families should not have to inhale hazardous acid fumes or spray harsh bleach just to keep their homes sparkling clean.",
    "storyHeading": "Born from a Simple Household Problem",
    "storyParagraph1": "Like millions of Indian families, we struggled with mineral-heavy borewell water in our bathrooms and stubborn mustard oil grease behind our kitchen stove. The only commercial solutions available were bottles of pungent hydrochloric acid and toxic chemical degreasers.",
    "storyParagraph2": "Not only were these chemical cleaners dangerous for our kids and pets to be around, but they also permanently etched tile grout, ruined expensive chrome shower fixtures, and left everyone coughing.",
    "storyParagraph3": "That led us to formulate and compress high-density German melamine micro-foam right here in India — a breakthrough material that lifts years of grime using nothing more than ordinary tap water.",
    "storyImage": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    "storyImageAlt": "Clean Indian living room",
    "valuesHeading": "The 4 Pillars of KAPEE Enterprise",
    "valuesSubtext": "What guides every sponge, cloth, and formula we develop.",
    "values": [
        {
            "id": "val-1",
            "icon": "Leaf",
            "title": "100% Chemical-Free",
            "desc": "Zero corrosive acids, zero chlorines. 100% safe around curious infants, toddlers and pets.",
            "active": True,
        },
        {
            "id": "val-2",
            "icon": "ShieldCheck",
            "title": "Made in India",
            "desc": "Engineered specifically for Indian tap water mineralization, spicy cooking grease, and high humidity.",
            "active": True,
        },
        {
            "id": "val-3",
            "icon": "Heart",
            "title": "Gentle on Surfaces",
            "desc": "Cleans deeply without scratching delicate glass partitions, ceramic tiles or chrome taps.",
            "active": True,
        },
        {
            "id": "val-4",
            "icon": "Sparkles",
            "title": "Honest Pricing",
            "desc": "Affordable multi-packs and bundles so every Indian household can live chemical-free.",
            "active": True,
        },
    ],
    "ctaHeading": "Join 50,000+ Happy Homes Across India",
    "ctaSubtext": "Switch to cleaner, brighter living today. Free express delivery on all orders above ₹499.",
    "ctaButtonText": "Explore Our Collection",
    "ctaButtonLink": "/shop",
    "seoTitle": "Our Story & Mission | KAPEE Enterprise",
    "seoDescription": "Learn about KAPEE Enterprise: bringing chemical-free, water-activated magic cleaning to 50,000+ Indian households.",
    "ogTitle": "Our Story & Mission | KAPEE Enterprise",
    "ogDescription": "Discover how KAPEE is replacing toxic household cleaners with water-activated German melamine foam.",
}
