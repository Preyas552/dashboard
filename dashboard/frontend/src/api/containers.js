import { apiRequest } from "./client";

export function listContainers() {
  return apiRequest("/containers");
}

export function startContainer(id) {
  return apiRequest(`/containers/${id}/start`, { method: "POST" });
}

export function stopContainer(id) {
  return apiRequest(`/containers/${id}/stop`, { method: "POST" });
}

export function restartContainer(id) {
  return apiRequest(`/containers/${id}/restart`, { method: "POST" });
}
