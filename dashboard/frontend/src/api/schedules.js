import { apiRequest } from "./client";

export function listSchedules() {
  return apiRequest("/schedules");
}

export function createSchedule(schedule) {
  return apiRequest("/schedules", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(schedule),
  });
}

export function setScheduleEnabled(id, enabled) {
  return apiRequest(`/schedules/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });
}

export function deleteSchedule(id) {
  return apiRequest(`/schedules/${id}`, { method: "DELETE" });
}

export function listExecutions(id) {
  return apiRequest(`/schedules/${id}/executions`);
}
