const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(path, options) {
  const res = await fetch(`${API_URL}${path}`, { credentials: "include", ...options });

  if (res.status === 401) {
    window.dispatchEvent(new Event("auth:unauthorized"));
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }

  return res.status === 204 ? null : res.json();
}
