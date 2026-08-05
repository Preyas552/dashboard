const API_URL = import.meta.env.VITE_API_URL;

async function request(path, options) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function login(username, password) {
  return request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
}

export function logout() {
  return request("/auth/logout", { method: "POST" });
}

export function me() {
  return request("/auth/me");
}
