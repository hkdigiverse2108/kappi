// Contact page content and contact-form enquiries (FastAPI backend, proxied by Vite under /api)

const CONTACT_URL = '/api/contact';
const ENQUIRIES_URL = `${CONTACT_URL}/enquiries`;

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

export const fetchContact = () => send(CONTACT_URL, 'GET');

// Replaces the whole contact page document
export const saveContact = (content) => send(CONTACT_URL, 'PUT', content);

export const fetchEnquiries = () => send(ENQUIRIES_URL, 'GET');

export const createEnquiry = (enquiry) => send(ENQUIRIES_URL, 'POST', enquiry);

export const updateEnquiryStatus = (id, status) =>
  send(`${ENQUIRIES_URL}/${encodeURIComponent(id)}`, 'PATCH', { status });

export const deleteEnquiry = (id) => send(`${ENQUIRIES_URL}/${encodeURIComponent(id)}`, 'DELETE');
