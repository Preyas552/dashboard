const API_URL = import.meta.env.VITE_API_URL;

async function request(path, options) {
  const res = await fetch(`${API_URL}${path}`, { credentials: "include", ...options });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function listContainers() {
  return request("/containers");
}

export function startContainer(id) {
  return request(`/containers/${id}/start`, { method: "POST" });
}

export function stopContainer(id) {
  return request(`/containers/${id}/stop`, { method: "POST" });
}

export function restartContainer(id) {
  return request(`/containers/${id}/restart`, { method: "POST" });
}
