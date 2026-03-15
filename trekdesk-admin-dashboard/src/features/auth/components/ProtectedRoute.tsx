import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Loader2 } from "lucide-react";

import styles from "./ProtectedRoute.module.css";

/**
 * Props for the ProtectedRoute component.
 */
interface ProtectedRouteProps {
  /** The components to render if the user is authenticated. */
  children: React.ReactNode;
}

/**
 * A wrapper component for routes that require authentication.
 *
 * This component:
 * 1. Checks if the authentication state is still loading.
 * 2. If authenticated, renders the child components.
 * 3. If not authenticated, redirects the user to the login page while
 *    preserving the intended destination in the location state.
 *
 * @param {ProtectedRouteProps} props - The component props.
 * @returns {JSX.Element} The protected content, a loading spinner, or a redirect.
 *
 * @example
 * ```tsx
 * <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 * ```
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show a loading state while checking authentication status
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  // If the user is not authenticated, redirect to the login page.
  // We attach the current location as state so the user can be redirected
  // back to their original destination after a successful login.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated: render the requested component(s)
  return <>{children}</>;
};

export default ProtectedRoute;
