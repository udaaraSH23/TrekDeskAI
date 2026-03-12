import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../context/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, Loader2, Rocket } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

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
    <div style={containerStyle}>
      <Card variant="glass" style={loginCardStyle}>
        <div style={logoContainerStyle}>
          <Rocket size={40} color="var(--primary)" />
          <h1 style={titleStyle}>TrekDesk AI</h1>
          <p style={subtitleStyle}>Admin Command Center</p>
        </div>

        <div style={dividerStyle}></div>

        <div style={contentStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "2rem",
              color: "var(--muted-foreground)",
            }}
          >
            <Shield size={16} />
            <span style={{ fontSize: "0.85rem" }}>Secure Admin Access</span>
          </div>

          <p
            style={{
              textAlign: "center",
              marginBottom: "2.5rem",
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.95rem",
              lineHeight: "1.6",
            }}
          >
            Welcome back! Please sign in with your authorized Google account to
            manage your AI trekking guides.
          </p>

          {error && <div style={errorBannerStyle}>{error}</div>}

          <div style={googleButtonWrapperStyle}>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "var(--primary)",
                }}
              >
                <Loader2 className="animate-spin" size={20} />
                <span style={{ fontWeight: 600 }}>
                  Verifying Credentials...
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  width: "100%",
                }}
              >
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

        <div style={footerStyle}>
          <p>© 2026 TrekDesk AI • Axiolon Labs</p>
        </div>
      </Card>

      {/* Background Decorative Elements */}
      <div style={circle1Style}></div>
      <div style={circle2Style}></div>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  height: "100vh",
  width: "100vw",
  backgroundColor: "#0c0c0e",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden",
};

const loginCardStyle: React.CSSProperties = {
  width: "450px",
  padding: "3rem",
  borderRadius: "24px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  position: "relative",
  zIndex: 10,
  backgroundColor: "rgba(12, 12, 14, 0.8)",
};

const logoContainerStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "2rem",
};

const titleStyle: React.CSSProperties = {
  fontSize: "2.2rem",
  fontWeight: 800,
  letterSpacing: "-1px",
  marginTop: "1rem",
  marginBottom: "4px",
  background: "linear-gradient(135deg, #fff 0%, #a78bfa 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const subtitleStyle: React.CSSProperties = {
  color: "var(--primary)",
  fontWeight: 700,
  fontSize: "0.8rem",
  textTransform: "uppercase",
  letterSpacing: "2px",
};

const dividerStyle: React.CSSProperties = {
  width: "60px",
  height: "4px",
  backgroundColor: "var(--primary)",
  borderRadius: "2px",
  marginBottom: "2.5rem",
};

const contentStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const googleButtonWrapperStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  justifyContent: "center",
  minHeight: "40px",
};

const footerStyle: React.CSSProperties = {
  marginTop: "3rem",
  fontSize: "0.75rem",
  color: "rgba(255,255,255,0.3)",
};

const errorBannerStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "rgba(239, 68, 68, 0.1)",
  color: "#ef4444",
  padding: "1rem",
  borderRadius: "12px",
  marginBottom: "2rem",
  border: "1px solid rgba(239, 68, 68, 0.2)",
  fontSize: "0.85rem",
  textAlign: "center",
};

// Decorative Elements
const circle1Style: React.CSSProperties = {
  position: "absolute",
  top: "-10%",
  right: "-10%",
  width: "500px",
  height: "500px",
  borderRadius: "50%",
  background:
    "radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)",
  zIndex: 1,
};

const circle2Style: React.CSSProperties = {
  position: "absolute",
  bottom: "-15%",
  left: "-5%",
  width: "600px",
  height: "600px",
  borderRadius: "50%",
  background:
    "radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)",
  zIndex: 1,
};

export default Login;
