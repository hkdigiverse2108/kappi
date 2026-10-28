// Product stock, set in Admin > Products as "Quantity in Stock" and counted in pieces: a pack uses its `pieces`
// (default 1), so with 5 in stock one "Pack of 3" can still be bought but a "Pack of 6" cannot.
// A product without a stock number (older products) is not tracked and is always available.

export const LOW_STOCK_LIMIT = 8;

export const isStockTracked = (product) => typeof product?.stock === 'number';

export const piecesOf = (variant) => Math.max(1, Number(variant?.pieces) || 1);

// How many of this pack can still be bought (Infinity when the stock is not tracked)
export const maxPacks = (product, variant) =>
  isStockTracked(product) ? Math.max(0, Math.floor(product.stock / piecesOf(variant))) : Infinity;

export const isVariantAvailable = (product, variant) => maxPacks(product, variant) > 0;

// Out of stock: not even the smallest pack can be bought
export const isOutOfStock = (product) => {
  if (!isStockTracked(product)) return false;
  const variants = product.variants?.length ? product.variants : [null];
  return variants.every((v) => !isVariantAvailable(product, v));
};

// The pack to add when a product is added without choosing one: the first pack that can still be bought
export const firstAvailableVariant = (product) =>
  product?.variants?.find((v) => isVariantAvailable(product, v)) || product?.variants?.[0];

export const isLowStock = (product) => isStockTracked(product) && !isOutOfStock(product) && product.stock <= LOW_STOCK_LIMIT;
