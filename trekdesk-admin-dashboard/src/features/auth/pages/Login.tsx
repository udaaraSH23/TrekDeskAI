import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, Loader2, Rocket } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

import styles from "./Login.module.css";

const Login: React.FC = () => {
  const { login, devLogin, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to home if already logged in or after successful login
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? "/";

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      try {
        await login(credentialResponse.credential);
        navigate(from, { replace: true });
      } catch (err) {
        console.error("Login failed", err);
      }
    }
  };

  return (
    <div className={styles.container}>
      <Card variant="glass" className={styles.loginCard}>
        <div className={styles.logoContainer}>
          <Rocket size={40} color="var(--primary)" />
          <h1 className={styles.title}>TrekDesk AI</h1>
          <p className={styles.subtitle}>Admin Command Center</p>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.content}>
          <div className={styles.shieldInfo}>
            <Shield size={16} />
            <span style={{ fontSize: "0.85rem" }}>Secure Admin Access</span>
          </div>

          <p className={styles.description}>
            Welcome back! Please sign in with your authorized Google account to
            manage your AI trekking guides.
          </p>

          {error && <div className={styles.errorBanner}>{error}</div>}

          <div className={styles.googleButtonWrapper}>
            {loading ? (
              <div className={styles.loadingSpinner}>
                <Loader2 className="animate-spin" size={20} />
                <span style={{ fontWeight: 600 }}>
                  Verifying Credentials...
                </span>
              </div>
            ) : (
              <div className={styles.googleLoginContainer}>
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={() => console.log("Login Failed")}
                  theme="filled_blue"
                  shape="pill"
                  size="large"
                  width="300"
                />

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

        <div className={styles.footer}>
          <p>© 2026 TrekDesk AI • Udara Shanuka - Axiolon Labs</p>
        </div>
      </Card>

      {/* Background Decorative Elements */}
      <div className={styles.circle1}></div>
      <div className={styles.circle2}></div>
    </div>
  );
};

export default Login;
