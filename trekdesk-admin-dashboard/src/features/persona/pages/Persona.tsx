import React, { useState, useEffect } from "react";
import { User, Info, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import {
  usePersonaSettings,
  useUpdatePersonaSettings,
} from "../hooks/usePersona";
import type { PersonaSettings } from "../types/persona.types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { VoicePlayground } from "../../voice/components/VoicePlayground";

import styles from "./Persona.module.css";

const Persona: React.FC = () => {
  const { data: settings, isLoading: loading } = usePersonaSettings();
  const updateMutation = useUpdatePersonaSettings();

  const [formData, setFormData] = useState<PersonaSettings>({
    voice_name: "",
    system_instruction: "",
    temperature: 1.0,
  });

  const [isShowingPlayground, setIsShowingPlayground] = useState(false);

  useEffect(() => {
    if (settings) {
      const timer = setTimeout(() => {
        setFormData({
          voice_name: settings.voice_name || "TrekDesk AI",
          system_instruction: settings.system_instruction || "",
          temperature: settings.temperature ?? 1.0,
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [settings]);

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Clock className="animate-spin" size={32} color="var(--primary)" />
      </div>
    );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className="flex items-center gap-md">
          <div className={styles.iconBox}>
            <User size={24} color="var(--primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", margin: 0 }}>
              AI Persona & Voice
            </h1>
            <p className="text-muted" style={{ fontSize: "0.9rem", margin: 0 }}>
              Configure how your AI assistant speaks and behaves with customers.
            </p>
          </div>
        </div>
      </header>

      {updateMutation.isSuccess && (
        <div className={`${styles.alert} ${styles.alertSuccess}`}>
          <CheckCircle2 size={18} />
          <span>
            Persona settings saved successfully! Your assistant is now using the
            updated configuration.
          </span>
        </div>
      )}

      {updateMutation.isError && (
        <div className={`${styles.alert} ${styles.alertError}`}>
          <AlertCircle size={18} />
          <span>
            Failed to save settings:{" "}
            {updateMutation.error instanceof Error
              ? updateMutation.error.message
              : "Unknown error"}
          </span>
        </div>
      )}

      <div className={styles.mainLayout}>
        {/* Left Side: Configuration */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Core Identity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.inputField}>
                <label className={styles.label}>Assistant Name</label>
                <input
                  type="text"
                  placeholder="e.g. TrekDesk Assistant"
                  value={formData.voice_name}
                  onChange={(e) =>
                    setFormData({ ...formData, voice_name: e.target.value })
                  }
                  className={styles.input}
                />
              </div>

              <div className={styles.inputField}>
                <div className="flex-between">
                  <label className={styles.label}>
                    System Instructions (Identity)
                    <Info
                      size={14}
                      className="text-muted"
                      style={{ marginLeft: "8px", cursor: "help" }}
                    />
                  </label>
                </div>
                <textarea
                  placeholder="You are a helpful assistant for TrekDesk..."
                  value={formData.system_instruction}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      system_instruction: e.target.value,
                    })
                  }
                  className={`${styles.input} ${styles.textarea}`}
                />
              </div>

              <div className={styles.saveSection}>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending
                    ? "Saving..."
                    : "Save Configuration"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div style={{ marginTop: "2rem" }}>
            <Button
              variant="outline"
              onClick={() => setIsShowingPlayground(true)}
              className="w-full"
            >
              Open Voice Studio
            </Button>
          </div>
        </div>

        {/* Right Side: Live Preview */}
        <div className={styles.previewContainer}>
          <div
            className="flex items-center gap-sm"
            style={{ marginBottom: "1rem" }}
          >
            <Badge variant="outline">Live Preview</Badge>
            <span className="text-muted" style={{ fontSize: "0.8rem" }}>
              Widget customer view
            </span>
          </div>

          <div className={styles.previewDevice}>
            <iframe
              src={`/embed/chat?color=${encodeURIComponent("#10b981")}&msg=${encodeURIComponent("Hi! I'm " + formData.voice_name + ". How can I help you?")}`}
              className={styles.previewFrame}
              title="Widget Preview"
            />
          </div>
        </div>
      </div>

      <VoicePlayground
        isOpen={isShowingPlayground}
        onClose={() => setIsShowingPlayground(false)}
      />
    </div>
  );
};

export default Persona;
