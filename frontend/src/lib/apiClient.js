const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Thin fetch wrapper. Not RTK Query - no caching, no auto-refetch, no
 * tags. Just: send a request, parse JSON, throw on non-2xx so
 * createAsyncThunk's .rejected branch picks it up via rejectWithValue.
 */
export default async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.detail || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}