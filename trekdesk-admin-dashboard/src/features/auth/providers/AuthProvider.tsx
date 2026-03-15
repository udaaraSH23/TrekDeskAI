/**
 * @file AuthProvider.tsx
 * @description Provides the AuthProvider component — the sole export of this file.
 *
 * Keeping this file to a single React component export is required for
 * Vite Fast Refresh to perform hot module replacement instead of full reloads.
 *
 * Related modules:
 *   - AuthContext.ts  → Context object + interface definition
 *   - useAuth.ts      → Consumer hook
 *
 * Authentication Flows Supported:
 * 1. Google OAuth — Standard production flow via `@react-oauth/google`
 * 2. Dev Secret Bypass — Development-only shortcut (requires `VITE_ENABLE_DEV_LOGIN=true`)
 */

import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "../context/AuthContext";
import { AuthService } from "../services/AuthService";
import { ApiError } from "../../../lib/errors/ApiError";
import type { User } from "../services/AuthService";

/**
 * AuthProvider
 *
 * The primary Context Provider that owns the authentication state for the entire
 * application. It initializes the session on mount and provides methods for
 * authentication actions.
 *
 * @param {Object} props - Component props.
 * @param {ReactNode} props.children - The application tree to be wrapped.
 * @returns {JSX.Element} The context provider wrapper.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  /**
   * loading state
   * Starts as `true` to prevent flickering the login page while the
   * initial session verification is in progress.
   */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * initializeAuth
   *
   * Attempts to silently restore a previous session on application load.
   * Reads the stored JWT from localStorage and verifies its validity with the backend.
   *
   * Note: 401 Unauthorized errors are handled globally by the api interceptor,
   * which will clear the token and redirect to login.
   */
  const initializeAuth = async () => {
    const token = AuthService.getToken();
    if (token) {
      try {
        const userData = await AuthService.verifySession();
        setUser(userData);
      } catch (err) {
        // We catch here primarily to ensure loading is set to false.
        // Specialized cleanup (like clearToken) is already handled by the interceptor.
        console.error("Session initialization skipped or failed", err);
        setUser(null);
      }
    }
    setLoading(false);
  };

  /**
   * Session Initialization Effect
   * Runs exactly once when the provider is first mounted at the root of the app.
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * login
   *
   * Exchanges a Google ID Token for a backend-issued JWT.
   * Persists the session token for use in subsequent authenticated API requests.
   *
   * @param {string} idToken - The ID token from Google.
   * @throws {ApiError} Re-throws the standardized error for UI consumption.
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
      const message =
        err instanceof ApiError ? err.message : "Authentication failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * devLogin
   *
   * Exchanges a plaintext development secret for a backend JWT.
   * This enables rapid local testing without requiring real Google OAuth.
   *
   * @param {string} secret - The dev secret.
   * @throws {ApiError} Re-throws standardized error for UI display.
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
      const message =
        err instanceof ApiError ? err.message : "Dev bypass failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * logout
   *
   * Synchronously destroys the local session.
   * Clears the JWT from storage and resets the user state to null.
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
