// Website footer content (FastAPI backend, proxied by Vite under /api)

const FOOTER_URL = '/api/footer';

const handleResponse = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // FastAPI validation errors come as a list
    const detail = Array.isArray(body.detail) ? body.detail[0]?.msg : body.detail;
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return res.json();
};

export const fetchFooter = () => fetch(FOOTER_URL).then(handleResponse);

// Replaces the whole footer document
export const saveFooter = (content) =>
  fetch(FOOTER_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content)
  }).then(handleResponse);
