// Policy pages: privacy, terms, refund, shipping (FastAPI backend, proxied by Vite under /api)

const POLICIES_URL = '/api/policies';

const handleResponse = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // FastAPI validation errors come as a list
    const detail = Array.isArray(body.detail) ? body.detail[0]?.msg : body.detail;
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return res.json();
};

export const fetchPolicies = () => fetch(POLICIES_URL).then(handleResponse);

// Replaces every policy page at once
export const savePolicies = (policies) =>
  fetch(POLICIES_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(policies)
  }).then(handleResponse);
