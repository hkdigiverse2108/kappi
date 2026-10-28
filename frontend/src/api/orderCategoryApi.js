// Order categories the admin tags orders with (FastAPI backend, proxied by Vite under /api)

const ORDER_CATEGORIES_URL = '/api/order-categories';

const handleResponse = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // FastAPI validation errors come as a list
    const detail = Array.isArray(body.detail) ? body.detail[0]?.msg : body.detail;
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return res.json();
};

const sendJson = (url, method, body) =>
  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(handleResponse);

// [{ id, name, color, orderCount }]
export const fetchOrderCategories = () => fetch(ORDER_CATEGORIES_URL).then(handleResponse);

// { name, color }
export const createOrderCategory = (category) => sendJson(ORDER_CATEGORIES_URL, 'POST', category);
export const updateOrderCategory = (id, category) =>
  sendJson(`${ORDER_CATEGORIES_URL}/${encodeURIComponent(id)}`, 'PUT', category);

// Orders in this category stay, without a category
export const deleteOrderCategory = (id) =>
  fetch(`${ORDER_CATEGORIES_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(handleResponse);
