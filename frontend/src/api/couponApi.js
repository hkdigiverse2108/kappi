// Coupons API (FastAPI backend, proxied by Vite under /api)

const COUPONS_URL = '/api/coupons';

const handleResponse = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }
  return res.json();
};

export const fetchCoupons = () => fetch(COUPONS_URL).then(handleResponse);

// Coupons a customer can use right now (status Active and not expired)
export const fetchActiveCoupons = () => fetch(`${COUPONS_URL}/active`).then(handleResponse);

// Creates the coupon, or replaces it if the id already exists
export const saveCoupon = (coupon) =>
  fetch(`${COUPONS_URL}/${encodeURIComponent(coupon.id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(coupon)
  }).then(handleResponse);

export const deleteCoupon = (id) =>
  fetch(`${COUPONS_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(handleResponse);
