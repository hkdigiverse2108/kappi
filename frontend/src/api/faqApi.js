// FAQ page content: questions, categories and page text (FastAPI backend, proxied by Vite under /api)

const FAQ_URL = '/api/faq';

const handleResponse = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // FastAPI validation errors come as a list
    const detail = Array.isArray(body.detail) ? body.detail[0]?.msg : body.detail;
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return res.json();
};

export const fetchFaq = () => fetch(FAQ_URL).then(handleResponse);

// Replaces the whole FAQ page document
export const saveFaq = (content) =>
  fetch(FAQ_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content)
  }).then(handleResponse);
