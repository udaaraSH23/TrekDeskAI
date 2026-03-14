/**
 * @file AuthContext.tsx
 * @description Provides the AuthProvider component — the sole export of this file.
 *
 * Keeping this file to a single React component export is required for
 * Vite Fast Refresh to perform hot module replacement instead of full reloads.
 *
 * Related modules:
 *   - authContextDef.ts  → AuthContext object + AuthContextType interface
 *   - useAuth.ts         → useAuth() consumer hook
 *
 * Authentication Flows Supported:
 * 1. Google OAuth — Standard production flow via `@react-oauth/google`
 * 2. Dev Secret Bypass — Development-only shortcut (requires `VITE_ENABLE_DEV_LOGIN=true`)
 *
 * Usage:
 * - Wrap the app in `<AuthProvider>` (done in `main.tsx`)
 * - Access state in any component via the `useAuth()` hook (from `useAuth.ts`)
 */
import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "../context/AuthContext";
import { AuthService } from "../services/AuthService";
import type { User } from "../services/AuthService";

/**
 * Type-safe helper that extracts a human-readable message from an unknown error.
 * Handles Axios-style errors, generic Error objects, and plain strings.
 *
 * @param err - The unknown error object to parse.
 * @param fallback - The default message to return if parsing fails.
 * @returns A human-readable error string.
 *
 * @internal This is a private utility for the AuthProvider.
 */
function getErrorMessage(err: unknown, fallback: string): string {
  if (err !== null && typeof err === "object" && "response" in err) {
    const axiosErr = err as { response?: { data?: { message?: string } } };
    if (axiosErr.response?.data?.message) {
      return axiosErr.response.data.message;
    }
  }
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

/**
 * AuthProvider
 * Context Provider component that owns the auth state and exposes actions.
 * Must be placed above any component that calls `useAuth()` in the component tree.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  // `loading` starts as `true` to prevent flashing a login page
  // before the initial session check completes on first render.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * initializeAuth
   * Attempts to silently restore a previous session on application load.
   * Reads the stored JWT from localStorage and verifies its validity with the backend.
   * If invalid or expired, the token is purged to force a clean re-login.
   */
  const initializeAuth = async () => {
    const token = AuthService.getToken();
    if (token) {
      try {
        const userData = await AuthService.verifySession();
        setUser(userData);
      } catch (err) {
        // Token is expired, tampered, or the server rejected it — clean slate
        console.error("Session verification failed", err);
        AuthService.clearToken();
        setUser(null);
      }
    }
    // Always mark loading as done, even if no token was found
    setLoading(false);
  };

  /**
   * On mount, synchronously attempt to restore session.
   * The empty dependency array ensures this runs exactly once per provider mount.
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * login
   * Exchanges a Google ID Token for a backend-issued JWT.
   * Persists the session token for use in subsequent API requests.
   * Re-throws errors so the `Login` page can surface them in the UI.
   */
  const login = async (idToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const { user: userData, token } =
        await AuthService.loginWithGoogle(idToken);
      AuthService.setToken(token);
      setUser(userData);
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Failed to login with Google");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * devLogin
   * Exchanges a plaintext development secret for a real backend JWT.
   * This enables rapid local testing without going through the full Google OAuth flow.
   *
   * Security: This bypass is completely disabled in production at the backend level.
   * Re-throws errors to allow the Login page to surface the failure message.
   */
  const devLogin = async (secret: string) => {
    setLoading(true);
    setError(null);
    try {
      const { user: userData, token } =
        await AuthService.loginWithDevSecret(secret);
      AuthService.setToken(token);
      setUser(userData);
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Failed to login with Dev Secret");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * logout
   * Synchronously destroys the local session.
   * The `ProtectedRoute` component will detect the null user and redirect to `/login`.
   * Note: This does NOT invalidate the JWT on the backend server.
   */
  const logout = () => {
    AuthService.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, devLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
