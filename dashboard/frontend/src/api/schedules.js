const API_URL = import.meta.env.VITE_API_URL;

async function request(path, options) {
  const res = await fetch(`${API_URL}${path}`, { credentials: "include", ...options });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export function listSchedules() {
  return request("/schedules");
}

export function createSchedule(schedule) {
  return request("/schedules", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(schedule),
  });
}

export function setScheduleEnabled(id, enabled) {
  return request(`/schedules/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });
}

export function deleteSchedule(id) {
  return request(`/schedules/${id}`, { method: "DELETE" });
}

export function listExecutions(id) {
  return request(`/schedules/${id}/executions`);
}
