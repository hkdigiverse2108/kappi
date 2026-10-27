CONTACT_COLLECTION = "contact_content"
ENQUIRY_COLLECTION = "enquiries"

# The contact page content is a single document with this _id
CONTACT_DOC_ID = "contact"

# Saved once into an empty database so the website shows the same contact page as before;
# after that everything is edited from Admin > CMS: Contact Us Page
DEFAULT_CONTACT_CONTENT = {
    "badge": "We're Here to Help",
    "heading": "Need Cleaning Guidance or Order Assistance?",
    "subheading": "Our chemical-free cleaning specialists and pan-India fulfillment desk are ready to assist you anytime.",
    "showInquiryForm": True,
    "cards": [
        {
            "id": "cc-1",
            "type": "whatsapp",
            "title": "WhatsApp Instant Support",
            "primaryText": "+91 98765 43210",
            "subtext": "Chat directly with our support specialists for fast answers on product compatibility and order status.",
            "actionText": "Start WhatsApp Chat",
            "actionUrl": "https://wa.me/919876543210?text=Hello%20KAPEE%20Team",
            "active": True,
        },
        {
            "id": "cc-2",
            "type": "phone",
            "title": "Helpline Phone",
            "primaryText": "+91 98765 43210",
            "subtext": "Available Mon-Sat: 9:00 AM – 7:00 PM IST",
            "actionText": "Call Support Now",
            "actionUrl": "tel:+919876543210",
            "active": True,
        },
        {
            "id": "cc-3",
            "type": "email",
            "title": "Customer Support Email",
            "primaryText": "support@kapee-enterprise.com",
            "subtext": "Typical response time: under 2 business hours",
            "actionText": "Send Email Query",
            "actionUrl": "mailto:support@kapee-enterprise.com",
            "active": True,
        },
        {
            "id": "cc-4",
            "type": "address",
            "title": "Registered Office & Fulfillment Center",
            "primaryText": "KAPEE Enterprise, Unit 4B, Industrial Estate, Marol, Andheri East, Mumbai, Maharashtra - 400069",
            "subtext": "",
            "actionText": "",
            "actionUrl": "",
            "active": True,
        },
    ],
    "formTitle": "Send Us a Direct Message",
    "formSubtitle": "Fill out the form below and we will get back to you with detailed assistance.",
    "successTitle": "Message Received!",
    "successMessage": "Thank you for contacting KAPEE Enterprise. One of our customer care advisors will respond to your inquiry shortly.",
    "successButtonText": "Send Another Message",
    "seoTitle": "Contact Us | Customer Support | KAPEE Enterprise",
    "seoDescription": "Get in touch with KAPEE Enterprise. WhatsApp support, customer care email, and order assistance across India.",
    "seoKeywords": "contact KAPEE Enterprise, KAPEE customer care, KAPEE WhatsApp support, magic eraser order help, cleaning products support India, KAPEE email",
    "ogTitle": "Contact Customer Support | KAPEE Enterprise",
    "ogDescription": "Reach our support team via WhatsApp, call or email for any order or product assistance.",
    "twitterTitle": "Contact Customer Support | KAPEE Enterprise",
    "twitterDescription": "Questions about your order or our magic erasers? Message KAPEE on WhatsApp, call or email us.",
    "ogImage": "https://kapee-enterprise.com/hero_banner.png",
}


async def setup_enquiry_indexes(db):
    await db[ENQUIRY_COLLECTION].create_index("id", unique=True)
    await db[ENQUIRY_COLLECTION].create_index("createdAt")
