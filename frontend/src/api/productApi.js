// Products API (FastAPI backend, proxied by Vite under /api)

const PRODUCTS_URL = '/api/products';

const handleResponse = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }
  return res.json();
};

export const fetchProducts = () => fetch(PRODUCTS_URL).then(handleResponse);

// Creates the product, or replaces it if the id already exists
export const saveProduct = (product) =>
  fetch(`${PRODUCTS_URL}/${encodeURIComponent(product.id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  }).then(handleResponse);

export const deleteProduct = (id) =>
  fetch(`${PRODUCTS_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(handleResponse);

// Product page data: product (by slug or id), its reviews, active coupons,
// "Frequently Bought Together" and "You May Also Like" products
export const fetchProductPage = (slug) =>
  fetch(`${PRODUCTS_URL}/${encodeURIComponent(slug)}/page`).then(handleResponse);
