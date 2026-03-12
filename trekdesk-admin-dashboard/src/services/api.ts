/**
 * @file api.ts
 * @description Centralized Axios instance for backend API communication.
 *
 * Responsibilities:
 *  1. Attaches the JWT Bearer token to every outgoing request automatically.
 *  2. Wraps every non-2xx response in an `ApiError` so all consumers get a
 *     typed, structured error with a human-readable message (extracted from
 *     the backend's standardized `{ status, statusCode, message }` envelope).
 *  3. Handles 401 Unauthorized globally by clearing the token and redirecting to login.
 *
 * Usage in services:
 * ```ts
 * import api from './api';
 * // Errors thrown here will always be ApiError instances
 * const response = await api.get<ApiSuccessResponse<T>>('/endpoint');
 * ```
 */

import axios from "axios";
import { ApiError } from "../lib/errors/ApiError";
import type { ApiErrorResponse } from "../types/api.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor:
 * Automatically attaches the local JWT token to every outgoing request.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("trekdesk_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response Interceptor:
 * Transforms every non-2xx Axios error into a typed `ApiError`.
 *
 * Error resolution priority:
 *  1. Backend envelope message → `response.data.message` (standardized field)
 *  2. Axios network error message (e.g. "Network Error" for no connection)
 *  3. Generic fallback
 *
 * The resulting `ApiError` has:
 *  - `.message`    → human-readable, safe to display directly in the UI
 *  - `.statusCode` → HTTP status code for conditional handling
 *  - `.isOperational` → true for 4xx (user error), false for 5xx (server bug)
 */
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // Handle structured backend error responses
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status ?? 500;
      const data = error.response?.data as ApiErrorResponse | undefined;

      // Extract the human-readable message from the backend's error envelope
      const message =
        data?.message ??
        error.message ??
        "An unexpected error occurred. Please try again.";

      // Handle 401 globally: clear token and redirect to login
      if (statusCode === 401) {
        localStorage.removeItem("trekdesk_token");
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login?expired=true";
        }
      }

      return Promise.reject(new ApiError(statusCode, message));
    }

    // Non-Axios error (e.g. a bug in a request interceptor) — re-throw as-is
    return Promise.reject(error);
  },
);

export default api;
