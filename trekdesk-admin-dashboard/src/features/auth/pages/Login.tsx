/**
 * @file Login.tsx
 * @description The primary entry point for administrative authentication.
 *
 * This page provides:
 * 1. Google OAuth 2.0 integration via `@react-oauth/google`.
 * 2. A development-only bypass mechanism for rapid local testing.
 * 3. Automatic redirection to the user's intended destination post-login.
 */

import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, Loader2, Rocket } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

import styles from "./Login.module.css";

/**
 * Login Component
 *
 * Renders the administrative login portal with glassmorphism aesthetics.
 * Handles the communication between the Google login component and the
 * global `AuthContext`.
 */
const Login: React.FC = () => {
  const { login, devLogin, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Redirection Logic
   *
   * Retrieves the 'from' path from the router state. If the user was
   * redirected here by the `ProtectedRoute` (e.g., trying to access
   * /settings while guest), `location.state.from` will contain that path.
   * Defaults to root dashboard ('/') if no previous state exists.
   */
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? "/";

  /**
   * handleSuccess
   * Triggered when Google successfully verifies the user and returns
   * an ID Token (credential).
   *
   * @param {CredentialResponse} credentialResponse - The payload from Google.
   */
  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      try {
        // Exchange the Google token for a backend session
        await login(credentialResponse.credential);

        // Navigate to the original destination (or home) on success
        navigate(from, { replace: true });
      } catch (err) {
        // Errors are already handled/stringified by AuthProvider,
        // here we just log for debugging.
        console.error("Login failed", err);
      }
    }
  };

  return (
    <div className={styles.container}>
      {/* Decorative background gradients defined in CSS modules */}
      <Card variant="glass" className={styles.loginCard}>
        {/* Branding Section */}
        <div className={styles.logoContainer}>
          <Rocket size={40} color="var(--primary)" />
          <h1 className={styles.title}>TrekDesk AI</h1>
          <p className={styles.subtitle}>Admin Command Center</p>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.content}>
          {/* Security Indicator */}
          <div className={styles.shieldInfo}>
            <Shield size={16} />
            <span style={{ fontSize: "0.85rem" }}>Secure Admin Access</span>
          </div>

          <p className={styles.description}>
            Welcome back! Please sign in with your authorized Google account to
            manage your AI trekking guides.
          </p>

          {/* Validation/API error display */}
          {error && <div className={styles.errorBanner}>{error}</div>}

          <div className={styles.googleButtonWrapper}>
            {loading ? (
              /* Loading Feedback during token exchange */
              <div className={styles.loadingSpinner}>
                <Loader2 className="animate-spin" size={20} />
                <span style={{ fontWeight: 600 }}>
                  Verifying Credentials...
                </span>
              </div>
            ) : (
              <div className={styles.googleLoginContainer}>
                {/* Official Google Login Component */}
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={() => console.log("Login Failed")}
                  theme="filled_blue"
                  shape="pill"
                  size="large"
                  width="300"
                />

                {/* 
                  Dev Bypass 
                  Only rendered if VITE_ENABLE_DEV_LOGIN is set to "true" in .env.
                  Enables testing of the admin dashboard without real Google accounts.
                */}
                {import.meta.env.VITE_ENABLE_DEV_LOGIN === "true" && (
                  <Button
                    variant="outline"
                    style={{ borderStyle: "dashed" }}
                    onClick={async () => {
                      try {
                        const secret = prompt("Enter Dev Secret:");
                        if (secret) {
                          await devLogin(secret);
                          navigate(from, { replace: true });
                        }
                      } catch (err) {
                        console.error("Dev Login failed", err);
                      }
                    }}
                  >
                    Bypass with Dev Secret
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Attribution */}
        <div className={styles.footer}>
          <p>© 2026 TrekDesk AI • Udara Shanuka - Axiolon Labs</p>
        </div>
      </Card>

      {/* Modern decorative element: Animated floating circles */}
      <div className={styles.circle1}></div>
      <div className={styles.circle2}></div>
    </div>
  );
};

export default Login;
