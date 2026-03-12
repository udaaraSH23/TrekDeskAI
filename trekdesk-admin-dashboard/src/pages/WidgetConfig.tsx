import React, { useState } from "react";
import {
  Code2,
  Palette,
  Globe,
  Copy,
  ExternalLink,
  CheckCircle2,
  Layout,
  MessageCircle,
  Smartphone,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const WidgetConfig: React.FC = () => {
  const [primaryColor, setPrimaryColor] = useState("#10b981");
  const [position, setPosition] = useState<"left" | "right">("right");
  const [initialMessage, setInitialMessage] = useState(
    "Hi! Ready for a Kandy adventure?",
  );
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const embedCode = `<!--TrekDesk AI Widget-->
<script src="https://cdn.trekdesk.ai/widget.v1.js" async></script>
<script>
  window.trekdeskConfig = {
    agentId: "kandy-treks-001",
    primaryColor: "${primaryColor}",
    position: "${position}",
    initialMessage: "${initialMessage}"
  };
</script>`;

  const publicLink = `https://trekdesk.ai/chat/kandy-treks-001`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>
            Widget Configuration
          </h1>
          <p style={{ color: "var(--muted-foreground)" }}>
            Customize and deploy your AI widget to your website.
          </p>
        </div>
      </header>

      <div style={contentGridStyle}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          {/* Visual Customization */}
          <Card>
            <CardHeader style={{ border: "none" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Palette color="var(--primary)" size={20} />
                <CardTitle>Branding & Style</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div style={settingItemStyle}>
                <div style={labelContainerStyle}>
                  <p style={labelStyle}>Primary Brand Color</p>
                  <p style={subLabelStyle}>
                    Used for buttons, icons, and highlights.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={colorPickerStyle}
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{ width: "100px" }}
                  />
                </div>
              </div>

              <div style={settingItemStyle}>
                <div style={labelContainerStyle}>
                  <p style={labelStyle}>Widget Position</p>
                  <p style={subLabelStyle}>Where should the launcher appear?</p>
                </div>
                <div style={toggleGroupStyle}>
                  <Button
                    variant={position === "left" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setPosition("left")}
                  >
                    Bottom Left
                  </Button>
                  <Button
                    variant={position === "right" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setPosition("right")}
                  >
                    Bottom Right
                  </Button>
                </div>
              </div>

              <div style={settingItemStyle}>
                <div style={labelContainerStyle}>
                  <p style={labelStyle}>Initial AI Greeting</p>
                  <p style={subLabelStyle}>
                    The first message displayed to visitors.
                  </p>
                </div>
                <Input
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  style={{ width: "250px" }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Deployment Options */}
          <Card>
            <CardHeader style={{ border: "none" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Globe color="var(--primary)" size={20} />
                <CardTitle>Deployment</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {/* Embed Code */}
              <div style={deploymentSectionStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Code2 size={16} color="var(--primary)" />
                    <span style={{ fontWeight: 600 }}>Embed on Website</span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyScript}
                    icon={
                      copiedScript ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <Copy size={14} />
                      )
                    }
                  >
                    {copiedScript ? "Copied" : "Copy Code"}
                  </Button>
                </div>
                <pre style={codeBlockStyle}>{embedCode}</pre>
              </div>

              {/* Public Link */}
              <div style={deploymentSectionStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <ExternalLink size={16} color="var(--primary)" />
                    <span style={{ fontWeight: 600 }}>
                      Shareable Direct Link
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyLink}
                    icon={
                      copiedLink ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <Copy size={14} />
                      )
                    }
                  >
                    {copiedLink ? "Copied" : "Copy Link"}
                  </Button>
                </div>
                <div style={linkBoxStyle}>{publicLink}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Column */}
        <div
          style={{
            width: "400px",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <Card
            style={{
              flex: 1,
              position: "relative",
              overflow: "hidden",
              padding: "0",
            }}
          >
            <CardHeader
              style={{
                padding: "1rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Layout size={18} />
                <CardTitle style={{ fontSize: "1rem" }}>Live Preview</CardTitle>
              </div>
            </CardHeader>

            <CardContent style={previewContentStyle}>
              <div style={websiteMockStyle}>
                <div style={mockNavStyle}></div>
                <div style={mockHeroStyle}>
                  <div style={mockTextLine1}></div>
                  <div style={mockTextLine2}></div>
                </div>
              </div>

              {/* Floating Widget Mock */}
              <div
                style={{
                  ...widgetMockStyle,
                  [position]: "20px",
                  backgroundColor: primaryColor,
                }}
              >
                <MessageCircle size={24} color="white" />
              </div>

              {/* Chat Window Mock */}
              <div
                style={{
                  ...chatWindowMockStyle,
                  [position]: "20px",
                }}
              >
                <div
                  style={{ ...chatHeaderStyle, backgroundColor: primaryColor }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <div style={avatarStyle}>TA</div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: "0.8rem" }}>
                        Kandy Treks AI
                      </p>
                      <p style={{ fontSize: "0.65rem", opacity: 0.8 }}>
                        Online
                      </p>
                    </div>
                  </div>
                </div>
                <div style={chatBodyStyle}>
                  <div style={aiMsgStyle}>{initialMessage}</div>
                  <div style={userMsgStyle}>How much is the Knuckles trek?</div>
                </div>
              </div>
            </CardContent>

            <div style={previewFooterStyle}>
              <div style={{ display: "flex", gap: "1rem" }}>
                <Smartphone size={16} /> Desktop View
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  animation: "fadeIn 0.5s ease-out",
  height: "100%",
  display: "flex",
  flexDirection: "column",
};
const headerStyle: React.CSSProperties = { marginBottom: "2rem" };
const contentGridStyle: React.CSSProperties = {
  display: "flex",
  gap: "1.5rem",
  flex: 1,
};

const settingItemStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1.2rem 0",
  borderBottom: "1px solid var(--border)",
};

const labelContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};
const labelStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: "0.95rem",
};
const subLabelStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "var(--muted-foreground)",
};

const colorPickerStyle: React.CSSProperties = {
  width: "36px",
  height: "36px",
  border: "none",
  padding: "0",
  borderRadius: "8px",
  cursor: "pointer",
  backgroundColor: "transparent",
};

const toggleGroupStyle: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  backgroundColor: "rgba(0,0,0,0.2)",
  padding: "4px",
  borderRadius: "10px",
};

const deploymentSectionStyle: React.CSSProperties = {
  marginBottom: "2rem",
};

const codeBlockStyle: React.CSSProperties = {
  backgroundColor: "rgba(0,0,0,0.3)",
  padding: "1rem",
  borderRadius: "8px",
  fontSize: "0.8rem",
  color: "#a78bfa",
  border: "1px solid var(--border)",
  whiteSpace: "pre-wrap",
  margin: "0",
  fontFamily: "monospace",
};

const linkBoxStyle: React.CSSProperties = {
  backgroundColor: "rgba(0,0,0,0.3)",
  padding: "12px 16px",
  borderRadius: "8px",
  fontSize: "0.9rem",
  color: "var(--primary)",
  border: "1px solid var(--border)",
  fontFamily: "monospace",
};

const previewContentStyle: React.CSSProperties = {
  flex: 1,
  backgroundColor: "#1a1a1a",
  position: "relative",
  padding: "1rem",
};

const websiteMockStyle: React.CSSProperties = {
  height: "100%",
  backgroundColor: "#ffffff",
  borderRadius: "6px",
  padding: "1rem",
  opacity: 0.1,
};

const mockNavStyle: React.CSSProperties = {
  height: "20px",
  backgroundColor: "#000",
  marginBottom: "20px",
  borderRadius: "4px",
};
const mockHeroStyle: React.CSSProperties = {
  height: "100px",
  backgroundColor: "#e5e7eb",
  borderRadius: "8px",
  padding: "20px",
};
const mockTextLine1: React.CSSProperties = {
  height: "15px",
  width: "60%",
  backgroundColor: "#000",
  marginBottom: "10px",
};
const mockTextLine2: React.CSSProperties = {
  height: "15px",
  width: "40%",
  backgroundColor: "#000",
};

const widgetMockStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "20px",
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
  transition: "all 0.3s ease",
};

const chatWindowMockStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "90px",
  width: "320px",
  height: "380px",
  backgroundColor: "#1a1c1e",
  borderRadius: "16px",
  boxShadow: "0 12px 24px rgba(0,0,0,0.5)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.1)",
  transition: "all 0.3s ease",
};

const chatHeaderStyle: React.CSSProperties = {
  padding: "1.2rem",
  color: "white",
};

const avatarStyle: React.CSSProperties = {
  width: "28px",
  height: "28px",
  backgroundColor: "rgba(255,255,255,0.2)",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.7rem",
  fontWeight: 700,
};

const chatBodyStyle: React.CSSProperties = {
  flex: 1,
  padding: "1.2rem",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const aiMsgStyle: React.CSSProperties = {
  alignSelf: "flex-start",
  backgroundColor: "rgba(255,255,255,0.05)",
  padding: "10px 14px",
  borderRadius: "14px 14px 14px 0",
  fontSize: "0.8rem",
  maxWidth: "85%",
};

const userMsgStyle: React.CSSProperties = {
  alignSelf: "flex-end",
  backgroundColor: "var(--primary)",
  padding: "10px 14px",
  borderRadius: "14px 14px 0 14px",
  fontSize: "0.8rem",
  maxWidth: "85%",
  color: "white",
};

const previewFooterStyle: React.CSSProperties = {
  padding: "1rem",
  backgroundColor: "rgba(255,255,255,0.02)",
  borderTop: "1px solid var(--border)",
  fontSize: "0.75rem",
  color: "var(--muted-foreground)",
  display: "flex",
  justifyContent: "center",
};

export default WidgetConfig;
