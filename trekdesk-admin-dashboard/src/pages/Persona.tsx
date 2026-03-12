import React, { useState, useEffect } from "react";
import {
  Save,
  MessageSquare,
  Volume2,
  Settings2,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  usePersonaSettings,
  useUpdatePersonaSettings,
} from "../hooks/usePersona";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

const Persona: React.FC = () => {
  const { data: settings, isLoading: loading, error } = usePersonaSettings();
  const updateMutation = useUpdatePersonaSettings();

  const [localSettings, setLocalSettings] = useState({
    voice_name: "Aoede",
    system_instruction: "",
    temperature: 0.7,
  });
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (settings) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalSettings({
        voice_name: settings.voice_name || "Aoede",
        system_instruction: settings.system_instruction || "",
        temperature: settings.temperature || 0.7,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSuccessMessage("");
    updateMutation.mutate(localSettings, {
      onSuccess: () => {
        setSuccessMessage("AI Persona updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      },
    });
  };

  const saving = updateMutation.isPending;

  if (loading && !settings) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>
            AI Persona
          </h1>
          <p style={{ color: "var(--muted-foreground)" }}>
            Define your AI's personality, knowledge constraints, and vocal
            style.
          </p>
        </div>
        <Button
          onClick={handleSave}
          isLoading={saving}
          icon={!saving ? <Save size={18} /> : undefined}
        >
          Save Changes
        </Button>
      </header>

      {error && (
        <div style={errorBannerStyle}>
          {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      {successMessage && (
        <Badge
          variant="success"
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            width: "100%",
            justifyContent: "center",
            fontSize: "1rem",
          }}
        >
          {successMessage}
        </Badge>
      )}

      <div style={layoutGridStyle}>
        <section
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <Card>
            <CardHeader style={{ border: "none" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Sparkles size={20} color="var(--primary)" />
                <CardTitle>Core Personality</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p style={labelStyle}>System Instructions (The Brain)</p>
              <textarea
                style={textareaStyle}
                placeholder="Example: You are a professional trekking guide for Kandy Treks. You are encouraging, safety-conscious, and expert in Sri Lankan flora and fauna..."
                value={localSettings.system_instruction}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    system_instruction: e.target.value,
                  })
                }
              />
              <p style={hintStyle}>
                These instructions define exactly how the AI behaves and what it
                knows.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader style={{ border: "none" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Volume2 size={20} color="var(--primary)" />
                <CardTitle>Vocal Identity</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div style={grid2ColStyle}>
                <div>
                  <p style={labelStyle}>Voice Engine</p>
                  <select
                    style={selectStyle}
                    value={localSettings.voice_name}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        voice_name: e.target.value,
                      })
                    }
                  >
                    <option value="Aoede">Aoede (Expressive/Female)</option>
                    <option value="Charon">Charon (Professional/Male)</option>
                    <option value="Fenrir">Fenrir (Deep/Male)</option>
                    <option value="Kore">Kore (Friendly/Female)</option>
                    <option value="Puck">Puck (Fast/Male)</option>
                  </select>
                </div>
                <div>
                  <p style={labelStyle}>Language</p>
                  <select style={selectStyle} disabled>
                    <option>English (US) - Multimodal Live</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <aside
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <Card>
            <CardHeader style={{ border: "none" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Settings2 size={20} color="var(--primary)" />
                <CardTitle>Model Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ marginBottom: "1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <p style={labelStyle}>Temperature (Creativity)</p>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    {localSettings.temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  style={rangeStyle}
                  value={localSettings.temperature}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      temperature: parseFloat(e.target.value),
                    })
                  }
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    Precise
                  </span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    Creative
                  </span>
                </div>
              </div>

              <div style={infoBoxStyle}>
                <div style={{ marginRight: "12px", marginTop: "4px" }}>
                  <MessageSquare size={16} color="var(--primary)" />
                </div>
                <p style={{ fontSize: "0.8rem", lineHeight: "1.4", margin: 0 }}>
                  Lower temperature ensures facts are accurate. Higher
                  temperature makes the AI sound more natural and varied.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.05)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
            }}
          >
            <CardHeader style={{ border: "none", paddingBottom: "0.5rem" }}>
              <CardTitle style={{ fontSize: "1rem" }}>Quick Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--muted-foreground)",
                  marginBottom: "1.5rem",
                }}
              >
                Test how these instructions affect the AI's logic instantly.
              </p>
              <Button variant="outline" style={{ width: "100%" }}>
                Open Voice Playground
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  animation: "fadeIn 0.5s ease-out",
};
const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "2.5rem",
};
const layoutGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 340px",
  gap: "1.5rem",
  alignItems: "start",
};
const labelStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 600,
  marginBottom: "8px",
  color: "rgba(255,255,255,0.9)",
};
const textareaStyle: React.CSSProperties = {
  width: "100%",
  height: "300px",
  backgroundColor: "rgba(255,255,255,0.03)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  padding: "1rem",
  color: "white",
  fontSize: "0.95rem",
  lineHeight: "1.6",
  outline: "none",
  resize: "none",
};
const hintStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "var(--muted-foreground)",
  marginTop: "8px",
};
const grid2ColStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1rem",
};
const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.8rem",
  backgroundColor: "rgba(255,255,255,0.03)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  color: "white",
  outline: "none",
};
const rangeStyle: React.CSSProperties = {
  width: "100%",
  height: "6px",
  backgroundColor: "var(--border)",
  borderRadius: "3px",
  cursor: "pointer",
};
const infoBoxStyle: React.CSSProperties = {
  display: "flex",
  backgroundColor: "rgba(12, 12, 14, 0.4)",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid var(--border)",
};

const errorBannerStyle: React.CSSProperties = {
  backgroundColor: "rgba(239, 68, 68, 0.1)",
  color: "#ef4444",
  padding: "1rem",
  borderRadius: "10px",
  marginBottom: "1.5rem",
  border: "1px solid rgba(239, 68, 68, 0.2)",
};

export default Persona;
