import { createContext } from "react";
import type { User } from "../services/AuthService";

/**
 * Interface defining the shape of the global authentication context.
 * Consumed by the `AuthProvider` and the `useAuth` hook.
 */
export interface AuthContextType {
  /** The currently authenticated user, or `null` if the user is a guest. */
  user: User | null;
  /** Whether the application is currently checking/verifying a session token. */
  loading: boolean;
  /** A human-readable error message if a login or session verification failed. */
  error: string | null;
  /**
   * Executes the Google OAuth login flow.
   * @param idToken - The ID token from the Google login component.
   * @throws {ApiError}
   */
  login: (idToken: string) => Promise<void>;
  /**
   * Executes a development bypass login using a plaintext secret.
   * @param secret - The dev secret key.
   * @throws {ApiError}
   */
  devLogin: (secret: string) => Promise<void>;
  /**
   * Synchronously destroys the local session and redirects the user to login.
   */
  logout: () => void;
}

/**
 * The core React Context object for Authentication.
 * Initialized to `null` to ensure consumers use the hook/provider correctly.
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
