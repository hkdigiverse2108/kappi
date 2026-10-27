// Registered customers for the admin panel (FastAPI backend, proxied by Vite under /api)

const CUSTOMERS_URL = '/api/admin/customers';

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

const toBody = ({ name, email, phone, city, state }) => ({
  name,
  email,
  phone,
  city: city || '',
  state: state || ''
});

export const fetchCustomers = () => send(CUSTOMERS_URL, 'GET');
export const createCustomer = (customer) => send(CUSTOMERS_URL, 'POST', toBody(customer));
export const updateCustomer = (id, customer) =>
  send(`${CUSTOMERS_URL}/${encodeURIComponent(id)}`, 'PUT', toBody(customer));
export const deleteCustomer = (id) => send(`${CUSTOMERS_URL}/${encodeURIComponent(id)}`, 'DELETE');
