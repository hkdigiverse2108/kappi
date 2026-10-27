// Our Story (/about) page content (FastAPI backend, proxied by Vite under /api)

const OUR_STORY_URL = '/api/our-story';

const handleResponse = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // FastAPI validation errors come as a list
    const detail = Array.isArray(body.detail) ? body.detail[0]?.msg : body.detail;
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return res.json();
};

export const fetchOurStory = () => fetch(OUR_STORY_URL).then(handleResponse);

// Replaces the whole Our Story page document
export const saveOurStory = (content) =>
  fetch(OUR_STORY_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content)
  }).then(handleResponse);
