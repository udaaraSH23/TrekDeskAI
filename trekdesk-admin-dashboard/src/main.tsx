/**
 * @file main.tsx
 * @description Application bootstrap entry point.
 * Initializes the React root, injects global styles, and wraps the application
 * in the necessary context providers for authentication, API state management, and OAuth.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Global styles (Tailwind base, variables, and typography)
import "./index.css";

import App from "./App.tsx";

/**
 * Global Environment Configuration
 * Google Client ID is required for the @react-oauth/google provider.
 */
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * Application Hydration
 * The provider order is significant:
 * 1. GoogleOAuthProvider: Handles identity provider logic.
 * 2. AuthProvider: Manages internal user session state based on Google/Bypass credentials.
 * 3. QueryClientProvider: Provides the server-state cache (React Query/TanStack Query).
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
