export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('digitalstore_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If sending FormData, delete Content-Type to let browser set boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  // Ensure prefix /api if not present and not external URL
  let url = endpoint;
  if (!url.startsWith('http') && !url.startsWith('/api')) {
    url = `/api${url.startsWith('/') ? '' : '/'}${url}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = (data && data.error) || (typeof data === 'string' ? data : 'Request failed');
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => {
    const isFormData = body instanceof FormData;
    return apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body)
    });
  },
  put: (endpoint, body, options = {}) => {
    const isFormData = body instanceof FormData;
    return apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body)
    });
  },
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' })
};

export default api;
