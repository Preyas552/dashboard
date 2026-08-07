import { apiRequest } from "./client";

export function login(username, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
}

export function logout() {
  return apiRequest("/auth/logout", { method: "POST" });
}

export function me() {
  return apiRequest("/auth/me");
}
