import { handleFallbackRoute } from '../data/catalogFallbackService.js';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

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

  // Parse request body for fallback simulator
  let parsedBody = null;
  if (options.body && typeof options.body === 'string') {
    try {
      parsedBody = JSON.parse(options.body);
    } catch (e) {
      parsedBody = options.body;
    }
  } else if (options.body && typeof options.body === 'object') {
    parsedBody = options.body;
  }

  // Ensure correct URL with API_BASE_URL support
  let url = endpoint;
  if (!url.startsWith('http')) {
    const cleanEndpoint = url.startsWith('/') ? url : `/${url}`;
    const path = cleanEndpoint.startsWith('/api') ? cleanEndpoint : `/api${cleanEndpoint}`;
    url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    let data = null;
    let isJson = false;
    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
        isJson = true;
      } catch (e) {
        data = await response.text();
      }
    } else {
      data = await response.text();
    }

    // Check if Vercel SPA rewrite returned index.html for an API endpoint
    const isHtmlResponse = typeof data === 'string' && (
      contentType.includes('text/html') ||
      data.trim().startsWith('<!DOCTYPE') ||
      data.trim().startsWith('<html')
    );

    if (!response.ok || isHtmlResponse) {
      const fallback = handleFallbackRoute(endpoint, options, parsedBody);
      if (fallback !== null) {
        console.warn(`[Rollixia] Remote API unavailable or returned HTML rewrite (${response.status}). Serving client fallback for: ${endpoint}`);
        return fallback;
      }

      if (!response.ok) {
        const errorMsg = (data && data.error) || (typeof data === 'string' && !isHtmlResponse ? data : 'Request failed');
        const err = new Error(errorMsg);
        err.status = response.status;
        err.data = data;
        throw err;
      }
    }

    return data;
  } catch (err) {
    const fallback = handleFallbackRoute(endpoint, options, parsedBody);
    if (fallback !== null) {
      console.warn(`[Rollixia] Network error connecting to ${url}. Serving client fallback for: ${endpoint}`);
      return fallback;
    }
    throw err;
  }
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
