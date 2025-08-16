import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_GOV_URL,
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
});

api.interceptors.request.use((config) => {
  // Read token from localStorage
  const token = localStorage.getItem("access_token");

  // Skip adding token for login
  if (token && config.url !== "/api/v1/gov/login") {
    (config.headers as Record<string, string>)[
      "Authorization"
    ] = `Bearer ${token}`;
  }

  return config;
});
