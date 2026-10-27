// Top announcement ticker messages (FastAPI backend, proxied by Vite under /api)

const ANNOUNCEMENT_URL = '/api/announcement-bar';

const handleResponse = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // FastAPI validation errors come as a list
    const detail = Array.isArray(body.detail) ? body.detail[0]?.msg : body.detail;
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return res.json();
};

export const fetchAnnouncementBar = () => fetch(ANNOUNCEMENT_URL).then(handleResponse);

// Replaces the whole list of ticker messages
export const saveAnnouncementBar = (content) =>
  fetch(ANNOUNCEMENT_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content)
  }).then(handleResponse);
