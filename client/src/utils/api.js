import { handleFallbackRoute } from '../data/catalogFallbackService.js';

const rawApiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

function getEffectiveApiBase() {
  if (typeof window !== 'undefined') {
    const isProdHost = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    if (isProdHost && (rawApiUrl.includes('localhost') || rawApiUrl.includes('127.0.0.1'))) {
      return ''; // Ignore localhost on production domain
    }
  }
  return rawApiUrl;
}

let isApiOffline = false;
let lastOfflineCheck = 0;

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

  // Check if fast client fallback is available
  const hasFallback = handleFallbackRoute(endpoint, options, parsedBody);

  // If we recently detected the serverless endpoint is offline or returning 405 on this domain,
  // return fallback immediately to avoid repeated 405 errors in the browser console
  const apiBase = getEffectiveApiBase();
  const isRelative = !apiBase || (typeof window !== 'undefined' && apiBase.startsWith(window.location.origin));
  if (isApiOffline && isRelative && hasFallback !== null) {
    if (Date.now() - lastOfflineCheck > 60000) {
      isApiOffline = false; // Periodically re-test backend health
    } else {
      return hasFallback;
    }
  }

  // Ensure correct URL with API_BASE_URL support
  let url = endpoint;
  if (!url.startsWith('http')) {
    const cleanEndpoint = url.startsWith('/') ? url : `/${url}`;
    const path = cleanEndpoint.startsWith('/api') ? cleanEndpoint : `/api${cleanEndpoint}`;
    url = apiBase ? `${apiBase}${path}` : path;
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
      isApiOffline = true;
      lastOfflineCheck = Date.now();

      if (hasFallback !== null) {
        return hasFallback;
      }

      const errorMsg = (data && data.error) || (isHtmlResponse ? 'API endpoint returned HTML index document (service offline or unrouted)' : (typeof data === 'string' ? data : 'Request failed'));
      const err = new Error(errorMsg);
      err.status = isHtmlResponse ? 503 : response.status;
      err.data = data;
      throw err;
    }

    // Success response - mark online
    isApiOffline = false;
    return data;
  } catch (err) {
    isApiOffline = true;
    lastOfflineCheck = Date.now();
    if (hasFallback !== null) {
      return hasFallback;
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
