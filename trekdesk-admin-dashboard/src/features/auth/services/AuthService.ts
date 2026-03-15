/**
 * @file AuthService.ts
 * @description Service for handling user authentication and session management.
 *
 * Types are imported from `src/types/auth.types.ts` which is aligned with
 * the backend's `AuthUserSchema` (auth.schema.ts).
 */

import api from "../../../services/api";
import type { User, AuthResponse } from "../types/auth.types";

// Re-export `User` so existing imports of `User` from AuthService continue to work
// during the transition. Can be removed once all consumers import from auth.types.ts directly.
export type { User };

export const AuthService = {
  /**
   * Standard Google OAuth login flow.
   * Exchanges a Google ID Token for a backend-issued JWT + user object.
   * @param idToken - The Google ID token received from the frontend OAuth client.
   * @returns A promise resolving to the user and token data.
   * @throws {ApiError} If the authentication fails.
   */
  loginWithGoogle: async (idToken: string): Promise<AuthResponse["data"]> => {
    const response = await api.post<AuthResponse>(
      "/auth/google",
      { idToken },
      { headers: { "x-skip-toast": "true" } },
    );
    return response.data.data;
  },

  /**
   * Development-only login bypass.
   * Only works if `ENABLE_DEVELOPMENT_LOGIN=true` is set on the backend.
   * @param secret - The development secret key.
   * @returns A promise resolving to the user and token data.
   * @throws {ApiError} If the authentication fails or is disabled.
   */
  loginWithDevSecret: async (secret: string): Promise<AuthResponse["data"]> => {
    const response = await api.post<AuthResponse>(
      "/auth/dev-login",
      { secret },
      { headers: { "x-skip-toast": "true" } },
    );
    return response.data.data;
  },

  /**
   * Verifies the stored JWT token with the backend and returns the current user.
   * @returns A promise resolving to the current user object.
   * @throws {ApiError} If the token is invalid or expired.
   */
  verifySession: async (): Promise<User> => {
    const response = await api.get<AuthResponse>("/auth/verify", {
      headers: { "x-skip-toast": "true" },
    });
    return response.data.data.user;
  },

  /**
   * Persists the JWT to localStorage for use in subsequent requests.
   * @param token - The JWT token string.
   */
  setToken: (token: string) => {
    localStorage.setItem("trekdesk_token", token);
  },

  /**
   * Reads the JWT from localStorage.
   * @returns The stored token string, or null if no session exists.
   */
  getToken: () => {
    return localStorage.getItem("trekdesk_token");
  },

  /**
   * Destroys the local session token.
   */
  clearToken: () => {
    localStorage.removeItem("trekdesk_token");
  },
};
