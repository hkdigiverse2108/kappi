// Cart activity: the website reports every cart change, the admin panel reads it (FastAPI backend, proxied by Vite under /api)

const CART_TRACKING_URL = '/api/cart-tracking';
const VISITOR_KEY = 'kapee-visitor-id';

// Same id on every visit from this browser, so one visitor's cart changes stay together
const getVisitorId = () => {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = `v-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return `v-session${Math.random().toString(36).slice(2, 10)}`;
  }
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }
  return res.json();
};

const toLine = (item) => ({
  productId: String(item.productId || ''),
  title: String(item.title || '').slice(0, 200),
  variantName: String(item.variantName || '').slice(0, 120),
  price: Number(item.price) || 0,
  quantity: Math.max(1, Math.round(Number(item.quantity)) || 1),
  image: typeof item.image === 'string' && item.image.length <= 500 ? item.image : ''
});

// action: 'add' | 'update' | 'remove' | 'clear'; line = the changed cart line; items = the whole cart afterwards
// Never throws: tracking must not get in the way of shopping
export const trackCartEvent = (action, line, items) => {
  try {
    fetch(`${CART_TRACKING_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        visitorId: getVisitorId(),
        action,
        line: line ? toLine(line) : null,
        items: items.filter((i) => !i.isFreeGift).slice(0, 60).map(toLine),
        page: window.location.pathname
      })
    }).catch(() => {});
  } catch {
    // ignore
  }
};

// { summary, topProducts, carts, events } for the last `days` days
export const fetchCartTracking = (days = 30) => fetch(`${CART_TRACKING_URL}?days=${days}`).then(handleResponse);

export const bulkDeleteCartTracking = (ids) =>
  fetch(`${CART_TRACKING_URL}/bulk-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids })
  }).then(handleResponse);

export const deleteCartTracking = (id) =>
  fetch(`${CART_TRACKING_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(handleResponse);
