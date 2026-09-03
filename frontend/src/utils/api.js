const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('lifeos_token');
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    localStorage.removeItem('lifeos_token');
    localStorage.removeItem('lifeos_user');
    window.location.reload();
  }

  return res;
}

export { API_BASE };
