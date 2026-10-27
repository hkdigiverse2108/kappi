// Customer login & account API (FastAPI backend, proxied by Vite under /api).
// The session is an httpOnly cookie set by the backend, so no token is handled here.

const handleResponse = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // FastAPI validation errors come as a list
    const detail = Array.isArray(body.detail) ? body.detail[0]?.msg : body.detail;
    const error = new Error(detail || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return res.json();
};

const send = (url, method, data) =>
  fetch(url, {
    method,
    credentials: 'same-origin',
    headers: data ? { 'Content-Type': 'application/json' } : undefined,
    body: data ? JSON.stringify(data) : undefined
  }).then(handleResponse);

export const register = (data) => send('/api/auth/register', 'POST', data);
// Login is two steps: password (emails a code) -> code (starts the session)
export const login = (email, password) => send('/api/auth/login', 'POST', { email, password });
export const verifyLoginOtp = (email, otp) => send('/api/auth/login/verify-otp', 'POST', { email, otp });
export const logout = () => send('/api/auth/logout', 'POST');
export const fetchMe = () => send('/api/auth/me', 'GET');

// Forgot password: email OTP -> verify -> new password
export const forgotPassword = (identifier) => send('/api/auth/forgot-password', 'POST', { identifier });
export const verifyOtp = (identifier, otp) => send('/api/auth/verify-otp', 'POST', { identifier, otp });
export const resetPassword = (identifier, resetToken, password) =>
  send('/api/auth/reset-password', 'POST', { identifier, resetToken, password });

// Logged-in customer's own account
export const updateProfile = (data) => send('/api/account/profile', 'PUT', data);
export const addAddress = (data) => send('/api/account/addresses', 'POST', data);
export const updateAddress = (id, data) => send(`/api/account/addresses/${encodeURIComponent(id)}`, 'PUT', data);
export const deleteAddress = (id) => send(`/api/account/addresses/${encodeURIComponent(id)}`, 'DELETE');
export const setDefaultAddress = (id) => send(`/api/account/addresses/${encodeURIComponent(id)}/default`, 'PUT');
