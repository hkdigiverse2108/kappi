// "Frequently Added With This" in the cart: the "You May Also Like" products chosen in
// Admin > Products for the products in the cart (latest added first), minus what is already in the cart
export const cartSuggestions = (items, products, limit = 3) => {
  const byId = new Map(products.map((p) => [p.id, p]));
  const inCart = new Set(items.map((i) => i.productId));
  const suggested = [];
  [...items]
    .reverse()
    .filter((i) => !i.isFreeGift)
    .forEach((i) => {
      (byId.get(i.productId)?.youMayAlsoLikeIds || []).forEach((id) => {
        if (!inCart.has(id) && !suggested.includes(id) && byId.has(id)) suggested.push(id);
      });
    });
  return suggested.slice(0, limit).map((id) => byId.get(id));
};
