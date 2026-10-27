// Cart rewards (free shipping, free gift, extra discount) and cart fees (FastAPI backend, proxied by Vite under /api)

const CART_OFFERS_URL = '/api/cart-offers';

const handleResponse = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // FastAPI validation errors come as a list
    const detail = Array.isArray(body.detail) ? body.detail[0]?.msg : body.detail;
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return res.json();
};

export const fetchCartOffers = () => fetch(CART_OFFERS_URL).then(handleResponse);

export const saveCartOffers = (offers) =>
  fetch(CART_OFFERS_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(offers)
  }).then(handleResponse);
