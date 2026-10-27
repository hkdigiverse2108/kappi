// Orders API (FastAPI backend, proxied by Vite under /api)
import { istDate } from '../utils/istTime';

const ORDERS_URL = '/api/orders';

const handleResponse = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = Array.isArray(body.detail) ? 'Please check your details and try again.' : body.detail;
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

// Website checkout: prices and the total are worked out again by the backend
export const placeOrder = (order) => sendJson(ORDERS_URL, 'POST', order);

// Orders of the signed-in customer (My Account)
export const fetchMyOrders = () => fetch(`${ORDERS_URL}/mine`).then(handleResponse);

// Public status of one order (Track Order and order success pages)
export const trackOrder = (orderNumber) =>
  fetch(`${ORDERS_URL}/track/${encodeURIComponent(orderNumber.trim())}`).then(handleResponse);

// Admin
export const fetchOrders = () => fetch(ORDERS_URL).then(handleResponse);
export const createManualOrder = (order) => sendJson(`${ORDERS_URL}/manual`, 'POST', order);
export const updateOrder = (id, changes) => sendJson(`${ORDERS_URL}/${encodeURIComponent(id)}`, 'PATCH', changes);
// Read / unread in the admin notifications (no ids = every order)
export const markOrdersRead = (ids, read = true) => sendJson(`${ORDERS_URL}/read`, 'POST', { ids, read });
export const deleteOrder = (id) =>
  fetch(`${ORDERS_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(handleResponse);

export const formatOrderDate = (iso) => (iso ? istDate(iso) : '');

// Backend order -> the fields the website's account, success and tracking pages show
export const toCustomerOrder = (order) => ({
  id: order.orderNumber,
  date: formatOrderDate(order.createdAt),
  createdAt: order.createdAt,
  status: order.status,
  statusHistory: order.statusHistory || [],
  total: order.pricing?.total ?? 0,
  pricing: order.pricing || {},
  paymentMethod: order.payment?.method || '',
  carrier: order.fulfillment?.courier || '',
  trackingNumber: order.fulfillment?.awb || '',
  trackingUrl: order.fulfillment?.trackingUrl || '',
  items: (order.items || []).map((it) => ({
    title: it.title,
    variantName: it.variant,
    quantity: it.quantity,
    price: it.price,
    image: it.image,
    isFreeGift: !!it.isFreeGift
  }))
});
