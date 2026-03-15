/**
 * @file AuthContext.ts
 * @description Defines the Authentication Context and its associated types.
 *
 * This module serves as the contract for authentication state management
 * across the application. It is populated by the `AuthProvider` and
 * consumed via the `useAuth` hook.
 */

import { createContext } from "react";
import type { User } from "../services/AuthService";

/**
 * Interface defining the shape of the global authentication context.
 *
 * Provides reactive state (user, loading, error) and methods to
 * perform login/logout actions.
 */
export interface AuthContextType {
  /**
   * The currently authenticated user object.
   * Is `null` if no active session exists or token verification failed.
   */
  user: User | null;

  /**
   * Global loading flag.
   * True during:
   * 1. Initial application mount (verifying existing session).
   * 2. Active login/token-exchange processes.
   */
  loading: boolean;

  /**
   * Sticky error message from the most recent authentication attempt.
   * Reset to `null` whenever a new login attempt begins.
   */
  error: string | null;

  /**
   * login
   * Executes the Google OAuth login flow by exchanging an ID Token
   * for a backend-signed JWT.
   *
   * @param idToken - The ID token JWT string provided by Google.
   * @throws {Error} If the backend rejects the token or is unreachable.
   */
  login: (idToken: string) => Promise<void>;

  /**
   * devLogin
   * Executes a development-only login using a plaintext secret.
   * ONLY active if `VITE_ENABLE_DEV_LOGIN` is true.
   *
   * @param secret - The developer secret key.
   * @throws {Error} If the secret is incorrect or the feature is disabled.
   */
  devLogin: (secret: string) => Promise<void>;

  /**
   * logout
   * Synchronously destroys the local session (clears token and user state).
   * Triggers redirection via `ProtectedRoute`.
   */
  logout: () => void;
}

/**
 * The core React Context object for Authentication.
 *
 * Initialized with `undefined`. Consumer hook `useAuth` will throw
 * if used outside of the corresponding `AuthProvider`.
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
