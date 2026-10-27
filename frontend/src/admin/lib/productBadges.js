// Products with this badge are shown in the Home page "Best Sellers" section (see backend services/home.py)
export const BESTSELLER_BADGE = 'Bestseller';

// Badge options for the product form (a product can have several)
export const PRODUCT_BADGES = [BESTSELLER_BADGE, 'New Launch', 'Popular'];

// A product's badges as a list (older products only have the single `badge` field)
export const productBadgeList = (product) =>
  Array.isArray(product?.badges) ? product.badges : product?.badge ? [product.badge] : [];
