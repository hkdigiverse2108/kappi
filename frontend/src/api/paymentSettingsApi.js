// Payment options shown at checkout (FastAPI backend, proxied by Vite under /api)

const PAYMENT_SETTINGS_URL = '/api/payment-settings';

const handleResponse = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // FastAPI validation errors come as a list
    const detail = Array.isArray(body.detail) ? body.detail[0]?.msg : body.detail;
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return res.json();
};

export const fetchPaymentSettings = () => fetch(PAYMENT_SETTINGS_URL).then(handleResponse);

// { codEnabled, razorpayEnabled } - at least one must be on
export const savePaymentSettings = (settings) =>
  fetch(PAYMENT_SETTINGS_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  }).then(handleResponse);
