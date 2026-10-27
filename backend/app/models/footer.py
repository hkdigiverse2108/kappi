FOOTER_COLLECTION = "footer_content"

# The website footer content is a single document with this _id
FOOTER_DOC_ID = "footer"

# Saved once into an empty database so the website shows the same footer as before;
# after that everything is edited from Admin > CMS: Footer
DEFAULT_FOOTER_CONTENT = {
    "brandDescription": "Pure water-activated melamine sponges & chemical-free cleaning essentials for modern Indian homes.",
    "instagramUrl": "https://instagram.com",
    "facebookUrl": "https://facebook.com",
    "twitterUrl": "https://twitter.com",
    "shopHeading": "Shop",
    "shopLinks": [
        {"id": "shop-1", "label": "All Products", "path": "/shop"},
        {"id": "shop-2", "label": "Magic Eraser Sponges", "path": "/product/kapee-magic-eraser-standard"},
        {"id": "shop-3", "label": "Jumbo Eraser Blocks", "path": "/product/kapee-magic-eraser-jumbo"},
        {"id": "shop-4", "label": "Dual-Action Scrub Pads", "path": "/product/kitchen-heavy-duty-scrub-pad"},
    ],
    "companyHeading": "Company",
    "companyLinks": [
        {"id": "company-1", "label": "Our Story", "path": "/about"},
        {"id": "company-2", "label": "Contact Support", "path": "/contact"},
        {"id": "company-3", "label": "Track Your Order", "path": "/track-order"},
        {"id": "company-4", "label": "Help & FAQs", "path": "/faqs"},
    ],
    "policiesHeading": "Policies",
    "newsletterHeading": "Newsletter",
    "newsletterText": "Cleaning tips, new launches & product updates in your inbox.",
    "newsletterSuccessText": "Thanks for subscribing! You'll hear from us soon.",
    "copyrightText": "KAPEE Enterprise. All Rights Reserved.",
}
