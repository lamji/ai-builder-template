import axios from "axios";

/**
 * Reusable Axios Instance
 *
 * This is the single source of truth for all HTTP requests.
 * All API calls across the project MUST use this instance.
 *
 * Features:
 * - Base URL from environment variable
 * - Default headers (JSON)
 * - Request interceptor for auth token injection
 * - Response interceptor for global error handling
 */

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ─────────────────────────────────
// Automatically attaches the auth token to every request.
api.interceptors.request.use(
  (config) => {
    // Client-side only: read token from localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────
// Handles common HTTP error codes globally.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    switch (status) {
      case 401:
        // Unauthorized – clear token and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
        break;
      case 403:
        console.error("[API] Forbidden: Access denied.");
        break;
      case 500:
        console.error("[API] Server error. Please try again later.");
        break;
      default:
        console.error(`[API] Error ${status}:`, error?.response?.data);
    }

    return Promise.reject(error);
  }
);

export default api;
