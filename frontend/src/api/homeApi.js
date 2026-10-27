// Home page content API (FastAPI backend, proxied by Vite under /api)

const HOME_URL = '/api/home';

const handleResponse = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }
  return res.json();
};

// Same URL and credentials as the <link rel="preload"> in index.html, so the browser reuses that download
export const fetchHome = () => fetch(HOME_URL, { credentials: 'same-origin' }).then(handleResponse);

export const saveHomeSection = (section, value) =>
  fetch(`${HOME_URL}/${section}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value })
  }).then(handleResponse);

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return fetch('/api/uploads', { method: 'POST', body: formData })
    .then(handleResponse)
    .then((data) => data.url);
};
