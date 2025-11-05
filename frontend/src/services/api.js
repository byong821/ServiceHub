// frontend/src/services/api.js
// API utility using native fetch (NO AXIOS)

const RAW_BASE = process.env.REACT_APP_API_URL || ''; // e.g. http://localhost:5001/api
const API_BASE_URL = RAW_BASE.replace(/\/+$/, '');    // trim trailing slash

function buildURL(endpoint = '') {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${path}`;
}

export function qs(params = {}) {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') u.append(k, String(v));
  });
  const s = u.toString();
  return s ? `?${s}` : '';
}

async function handleResponse(response) {
  let data = null;
  try {
    data = await response.json();
  } catch {
    // non-JSON response; leave data as null
  }
  if (!response.ok) {
    const err = new Error((data && (data.error || data.message)) || `Request failed (${response.status})`);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data ?? {};
}

export const api = {
  get: async (endpoint, params) => {
    const url = buildURL(endpoint) + (params ? qs(params) : '');
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include', // send session cookie
    });
    return handleResponse(res);
  },

  post: async (endpoint, body) => {
    const res = await fetch(buildURL(endpoint), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(res);
  },

  put: async (endpoint, body) => {
    const res = await fetch(buildURL(endpoint), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(res);
  },

  delete: async (endpoint) => {
    const res = await fetch(buildURL(endpoint), {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  uploadFile: async (endpoint, formData) => {
    const res = await fetch(buildURL(endpoint), {
      method: 'POST',
      credentials: 'include',
      // Don't set Content-Type when sending FormData
      body: formData,
    });
    return handleResponse(res);
  },
};
