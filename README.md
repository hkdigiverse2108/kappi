# KAPEE Enterprise — E-Commerce Web Application

> **Tagline:** *"Cleaner Solutions, Brighter Living"*  
> Premium e-commerce storefront for KAPEE Enterprise, an Indian direct-to-consumer brand specializing in 100% water-activated German melamine magic erasers and zero-chemical cleaning essentials.

---

## 🌟 Highlights & Features

1. **Prestige / Dawn-Class Shopify Aesthetics:**
   - Custom brand palette tailored from the logo: Emerald Deep (`#04403B`), Emerald (`#0A5C55`), Emerald Soft (`#E6F1EF`), Gold (`#C8962E`), Gold Light (`#EBCB6B`), Ivory (`#FBF8F1`), Cream (`#F4EEDF`), and Ink (`#0E1F1D`).
   - Google Fonts: **Playfair Display** (editorial luxury serif headings) and **Plus Jakarta Sans** (clean, crisp modern UI typography).
   - Micro-interactions: Gold-shine hover sweeps on buttons, card lift transitions, interactive Before/After draggable transformation slider, and cart bump animations.

2. **Global Navigation & Layout:**
   - **Announcement / Offer Ticker:** Auto-rotating messages (Free shipping ₹499+, Buy 2 @ ₹X, KAPEE10 coupon, COD available), dismissible.
   - **Sticky Shrinking Navbar:** Blurs on scroll, limited clean menu (`Home`, `Shop`, `Combos [Save more]`, `Our Story`, `Contact`, `How It Works`, `FAQs`).
   - **Shop Mega-Menu:** Desktop mega-menu featuring category breakdown, best seller thumbnails with quick Add to Cart, and bundle promo tile.
   - **Full-Screen Search Overlay:** Real-time search suggestions with product thumbnails and popular search chips.
   - **Slide-in Cart Drawer & Offer Unlocks:**
     - ₹499 → Free Express Shipping
     - ₹799 → Free Bonus Magic Eraser (auto-added as ₹0 gift item)
     - ₹999 → Extra 10% VIP Tier discount
     - Emerald + Gold `canvas-confetti` celebrations on threshold unlock.
     - Coupon code validation (`KAPEE10`, `WELCOME10`, `COMBO20`).
     - Eco-gift packaging option (+₹29), delivery notes, and instant upsells.
   - **Mobile-First Experience:** Full-height slide-in hamburger drawer with category accordions + sticky bottom navigation bar (`Home`, `Shop`, `Combos`, `Cart`, `Account`).
   - **Floating Actions:** Pre-filled WhatsApp chat button and back-to-top scroll button.

3. **Product Detail Page (PDP):**
   - High-resolution gallery with thumbnail switcher and fullscreen zoom Lightbox.
   - Inline pack selector pills (Pack of 1 / 3 / 5 / 10) with live per-piece price calculation.
   - Live Indian PIN code delivery checker (express delivery ETA + COD verification).
   - "Frequently Bought Together" bundle builder with combined total and 1-click add.
   - In-page sticky navigation tabs: Overview, How to Use (Wet → Squeeze → Wipe → Rinse) with Do's & Don'ts, Surface Compatibility Guide, Specifications, Customer Reviews (with photo upload modal & star distribution), and Product FAQs.

4. **Combos & Interactive Bundle Builder:**
   - Fixed-price custom builder: "Buy 2 @ ₹399", "Buy 3 @ ₹549", "Buy 5 @ ₹849".
   - Visual slot tracker (Slot 1, Slot 2, Slot 3...) with one-click product filling and confetti on completion.
   - Pre-curated bundles: Starter Magic Kit, Kitchen Grease Buster Trio, Bathroom Hard-Water Descaling Duo, and Family Value Deep-Clean Hamper.

5. **Shopify-Style Frictionless Checkout:**
   - Contact info → Shipping Address (PIN code auto-fills City and State) → Payment (UPI / QR, Cards, Cash on Delivery) with bank-grade 256-bit encryption simulated processing.
   - Confetti-celebrated Order Success page with live tracking link and order details.
   - Order tracking page with animated status timeline: *Ordered → Packed → Shipped → Out for Delivery → Delivered*.
   - User account portal with saved delivery addresses, order history, and wishlist synchronization.

---

## 🛠️ Tech Stack

- **Framework:** React 18 + Vite (ES Modules)
- **Routing:** React Router v6
- **Styling:** Tailwind CSS (Custom Theme) + PostCSS
- **State Management & Persistence:** Zustand (with `persist` middleware storing cart, wishlist, user addresses, and recently viewed in `localStorage`)
- **Animations & Celebrations:** Framer Motion & `canvas-confetti`
- **Icons:** `lucide-react`
- **SEO & Social Meta:** `react-helmet-async`

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will launch locally at `http://localhost:5173/` (or `http://localhost:5174/`).

### 3. Production Build
```bash
npm run build
```
Generates an optimized production build in the `/dist` directory.

---

## 📁 Project Structure

```text
kapee-ui/
├── public/
│   ├── favicon.png          # KAPEE logo favicon
│   └── logo.png             # Master brand logo
├── src/
│   ├── assets/
│   │   └── logo.png         # Brand logo (untouched, aspect ratio preserved)
│   ├── components/
│   │   ├── cart/
│   │   │   └── CartDrawer.jsx        # Slide-in cart with milestone progress
│   │   ├── common/
│   │   │   ├── FloatingActions.jsx   # WhatsApp button & back-to-top
│   │   │   ├── LeafLoader.jsx        # Initial fast leaf loader (<1s)
│   │   │   ├── Logo.jsx              # Reusable logo with dark background badge support
│   │   │   └── ScrollToTop.jsx       # Route-change scroll reset
│   │   ├── home/
│   │   │   └── BeforeAfterSlider.jsx # Interactive before/after transformation slider
│   │   ├── layout/
│   │   │   ├── AnnouncementBar.jsx   # Auto-rotating offer banner
│   │   │   ├── Footer.jsx            # Emerald deep footer with policies & links
│   │   │   ├── MobileBottomBar.jsx   # Sticky mobile navigation
│   │   │   ├── MobileMenuDrawer.jsx  # Slide-in mobile menu with accordions
│   │   │   ├── Navbar.jsx            # Sticky navbar with mega-menu
│   │   │   ├── SearchOverlay.jsx     # Full-screen search with live suggestions
│   │   │   └── ShopMegaMenu.jsx      # Desktop mega-menu
│   │   └── product/
│   │       ├── ProductCard.jsx       # Card with hover-swap, variant pills & badges
│   │       └── QuickViewModal.jsx    # Quick view dialog
│   ├── data/
│   │   ├── bundles.js       # Pre-made combos and build-your-bundle tiers
│   │   ├── faqs.js          # Categorized FAQs
│   │   ├── guides.js        # Cleaning articles and tutorials
│   │   ├── offers.js        # Milestone thresholds, discount coupons, gift wrap
│   │   ├── products.js      # 12+ realistic cleaning products & categories
│   │   └── reviews.js       # 25+ realistic Indian customer reviews & ratings
│   ├── pages/
│   │   ├── About.jsx        # Brand story and mission
│   │   ├── Account.jsx      # User profile, orders, saved addresses
│   │   ├── Cart.jsx         # Full cart page
│   │   ├── Checkout.jsx     # Frictionless multi-step checkout
│   │   ├── Combos.jsx       # Combos & interactive bundle builder
│   │   ├── Contact.jsx      # Contact info, inquiry form, WhatsApp
│   │   ├── FAQ.jsx          # Help center with search
│   │   ├── GuideDetail.jsx  # Individual cleaning article reader
│   │   ├── Guides.jsx       # Knowledge hub
│   │   ├── Home.jsx         # 12-section flagship home page
│   │   ├── HowItWorks.jsx   # Melamine foam science & surface guide
│   │   ├── Login.jsx        # Auth & demo fast login
│   │   ├── NotFound.jsx     # 404 page
│   │   ├── OrderSuccess.jsx # Celebratory order confirmation
│   │   ├── PolicyPage.jsx   # Unified legal policy template
│   │   ├── ProductDetail.jsx# Full-featured PDP
│   │   ├── SearchResults.jsx# Search discovery
│   │   ├── Shop.jsx         # Collection page with sticky filters
│   │   └── Wishlist.jsx     # Saved items with WhatsApp share
│   ├── store/
│   │   ├── useCartStore.js     # Cart state, coupons, celebrations, calculations
│   │   ├── useUIStore.js       # Modals, drawer states, recently viewed
│   │   ├── useUserStore.js     # Auth, orders, saved addresses
│   │   └── useWishlistStore.js # Saved wishlist products
│   ├── utils/
│   │   └── confetti.js      # Emerald & gold canvas-confetti triggers
│   ├── App.jsx              # Main routing & layout integration
│   ├── index.css            # Custom CSS & Tailwind utilities
│   └── main.jsx             # React DOM entry point
├── index.html               # Google Fonts & SEO tags
├── tailwind.config.js       # Brand color palette & animations
└── package.json
```

---

## ⚙️ How to Customize Data, Offers & Thresholds

All store data lives inside `/src/data` so clients or non-technical administrators can easily modify prices, images, and offers without touching application code.

### 1. Editing Products (`/src/data/products.js`)
To add a new product or edit prices/variants:
```javascript
{
  id: 'prod-1',
  slug: 'kapee-magic-eraser-standard',
  title: 'KAPEE Magic Eraser Sponge',
  category: 'Magic Erasers', // 'Magic Erasers', 'Kitchen', 'Bathroom', 'Cloths & Scrubbers', 'Shoe & Car Care', 'Combos'
  basePrice: 149,
  baseMrp: 299,
  stock: 48,
  images: [ ... ], // Array of image URLs
  variants: [
    { id: 'v-1', name: 'Pack of 1', price: 149, mrp: 299, savings: 150, perPiece: 149 },
    { id: 'v-2', name: 'Pack of 3', price: 349, mrp: 799, savings: 450, perPiece: 116 },
    { id: 'v-3', name: 'Pack of 5', price: 499, mrp: 1299, savings: 800, perPiece: 99, bestValue: true }
  ],
  specs: { ... },
  beforeAfter: [ ... ]
}
```

### 2. Adjusting Offer Thresholds & Coupons (`/src/data/offers.js`)
To modify reward tiers or add new coupon codes:
```javascript
export const FREE_SHIPPING_THRESHOLD = 499;  // Threshold for ₹0 delivery
export const FREE_GIFT_THRESHOLD = 799;      // Threshold for bonus gift
export const EXTRA_DISCOUNT_THRESHOLD = 999;  // Threshold for extra 10% off
export const STANDARD_SHIPPING_FEE = 49;     // Fee below ₹499
export const GIFT_WRAP_FEE = 29;             // Eco gift wrap cost

export const coupons = [
  {
    code: 'KAPEE10',
    discountType: 'percentage', // 'percentage' or 'flat'
    value: 10,
    minOrder: 499,
    description: '10% OFF on all orders above ₹499'
  }
];
```

### 3. Modifying Bundle Builder Tiers (`/src/data/bundles.js`)
Change the slot counts or fixed pricing for "Buy 2 / 3 / 5":
```javascript
export const bundleTiers = [
  { id: 'tier-2', name: 'Buy 2 Bundle', slots: 2, fixedPrice: 399, originalEstimate: 598, savings: 199 },
  { id: 'tier-3', name: 'Buy 3 Bundle', slots: 3, fixedPrice: 549, originalEstimate: 897, savings: 348 },
  { id: 'tier-5', name: 'Buy 5 Bundle', slots: 5, fixedPrice: 849, originalEstimate: 1495, savings: 646 }
];
```

---

## 🎨 Brand Design Guidelines

- **Logo:** `src/assets/logo.png` must be preserved as-is with its native aspect ratio.
- On dark emerald backgrounds, it is placed inside a white badge:
  ```jsx
  <Logo isDarkBackground={true} />
  ```
- **Primary Buttons:** `.btn-primary` (Emerald Deep `#04403B` with hover gold-shine animation).
- **CTA / Checkout Buttons:** `.btn-gold` (Rich gold gradient: `linear-gradient(135deg, #8F6414, #EBCB6B, #C8962E)`).

---

## 📄 License

© 2026 KAPEE Enterprise. All Rights Reserved. Made with pride in India.
