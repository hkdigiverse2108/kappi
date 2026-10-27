// Admin panel login API (separate session cookie from customers)

const handleResponse = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = Array.isArray(body.detail) ? body.detail[0]?.msg : body.detail;
    const error = new Error(detail || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export const adminLogin = (email, password) =>
  fetch('/api/admin/auth/login', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }).then(handleResponse);

export const adminLogout = () =>
  fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'same-origin' }).then(handleResponse);

export const fetchAdminMe = () => fetch('/api/admin/auth/me', { credentials: 'same-origin' }).then(handleResponse);
