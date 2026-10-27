// Newsletter subscribers (FastAPI backend, proxied by Vite under /api)

const NEWSLETTER_URL = '/api/newsletter';

const handleResponse = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // FastAPI validation errors come as a list
    const detail = Array.isArray(body.detail) ? body.detail[0]?.msg : body.detail;
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return res.json();
};

const send = (url, method, data) =>
  fetch(url, {
    method,
    headers: data ? { 'Content-Type': 'application/json' } : undefined,
    body: data ? JSON.stringify(data) : undefined
  }).then(handleResponse);

export const subscribe = (email, source = 'Footer Newsletter') =>
  send(`${NEWSLETTER_URL}/subscribe`, 'POST', { email, source });

export const fetchSubscribers = () => send(`${NEWSLETTER_URL}/subscribers`, 'GET');

export const deleteSubscriber = (id) =>
  send(`${NEWSLETTER_URL}/subscribers/${encodeURIComponent(id)}`, 'DELETE');
