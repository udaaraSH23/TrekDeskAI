/**
 * @file useAuth.ts
 * @description Custom React hook for consuming authentication state.
 *
 * Provides a type-safe wrapper around `useContext(AuthContext)`.
 */

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import type { AuthContextType } from "../context/AuthContext";

/**
 * useAuth
 *
 * Custom hook to consume the `AuthContext` from anywhere in the component tree.
 *
 * @returns {AuthContextType} The current auth state and actions (user, loading, login, etc).
 * @throws {Error} If called outside of an `<AuthProvider>`, protecting against
 *                 developer error where the context is undefined.
 *
 * @example
 * ```tsx
 * const { user, logout } = useAuth();
 * ```
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth must be used within an <AuthProvider>. " +
        "Ensure that your App component tree is wrapped in the provider.",
    );
  }

  return context;
};
