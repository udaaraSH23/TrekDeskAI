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
import { useUIStore } from "../store/uiStore";
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
 * Transforms every non-2xx Axios error into a typed `ApiError` and
 * triggers a global UI notification.
 */
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // Handle structured backend error responses
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status ?? 500;
      const data = error.response?.data as ApiErrorResponse | undefined;

      /**
       * Helper: Attempts to extract a clean string from the backend's message field.
       * If the message is a stringified JSON array (common for Zod validation),
       * it extracts the first error message.
       */
      const formatErrorMessage = (rawMessage: string): string => {
        try {
          // Check if it's a "Validation Failed: [...]" string
          if (rawMessage.startsWith("Validation Failed: ")) {
            const jsonPart = rawMessage.replace("Validation Failed: ", "");
            const parsed = JSON.parse(jsonPart);
            if (Array.isArray(parsed) && parsed[0]?.message) {
              return parsed[0].message.replace(
                /^body\.|^query\.|^params\./,
                "",
              );
            }
          }
          // Check if the message itself is a JSON array string
          if (rawMessage.startsWith("[")) {
            const parsed = JSON.parse(rawMessage);
            if (Array.isArray(parsed) && parsed[0]?.message) {
              return parsed[0].message.replace(
                /^body\.|^query\.|^params\./,
                "",
              );
            }
          }
        } catch {
          // If parsing fails, just fall back to the raw message
        }
        return rawMessage;
      };

      // Extract and clean the human-readable message
      const message = formatErrorMessage(
        data?.message ||
          error.message ||
          "An unexpected error occurred. Please try again.",
      );

      // Handle 401 globally: clear token and redirect to login
      if (statusCode === 401) {
        localStorage.removeItem("trekdesk_token");
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login?expired=true";
        }
      } else {
        const skipToast = error.config?.headers?.["x-skip-toast"] === "true";

        if (!skipToast) {
          useUIStore.getState().addNotification({
            message,
            type: "error",
          });
        }
      }

      return Promise.reject(new ApiError(statusCode, message));
    }

    // Non-Axios error (e.g. a bug in a request interceptor)
    return Promise.reject(error);
  },
);

export default api;
