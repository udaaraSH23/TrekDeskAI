import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import type { AuthContextType } from "../context/AuthContext";

/**
 * Custom hook to consume the `AuthContext` from anywhere in the component tree.
 * Ensures the component is wrapped in an `<AuthProvider>`.
 *
 * @returns {AuthContextType} The current auth state and actions.
 * @throws {Error} If called outside of an `<AuthProvider>`.
 *
 * @example
 * ```tsx
 * const { user, logout } = useAuth();
 * ```
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
