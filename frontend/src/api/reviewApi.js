// Reviews API (FastAPI backend, proxied by Vite under /api)

const REVIEWS_URL = '/api/reviews';

const handleResponse = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }
  return res.json();
};

export const fetchReviews = () => fetch(REVIEWS_URL).then(handleResponse);

// Creates the review, or replaces it if the id already exists
export const saveReview = (review) =>
  fetch(`${REVIEWS_URL}/${encodeURIComponent(review.id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review)
  }).then(handleResponse);

export const deleteReview = (id) =>
  fetch(`${REVIEWS_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(handleResponse);
