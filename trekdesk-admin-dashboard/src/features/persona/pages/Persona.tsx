/**
 * @file Persona.tsx
 * @description Page component for managing the AI Assistant's persona, voice identity,
 * and conversational constraints. It provides a real-time preview of the AI's configuration
 * via a simulated widget iframe.
 */

import React, { useState, useEffect } from "react";
import { Info, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import {
  usePersonaSettings,
  useUpdatePersonaSettings,
} from "../hooks/usePersona";
import { useWidgetSettings } from "../../widget/hooks/useWidgetSettings";
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

/**
 * Persona Component
 *
 * Orchestrates the AI's identity settings and provides a live preview.
 * Connected to the TanStack Query hooks for server state management.
 */
const Persona: React.FC = () => {
  // --- Server State ---
  const { data: settings, isLoading: loading } = usePersonaSettings();
  const { data: widgetSettings } = useWidgetSettings();
  const updateMutation = useUpdatePersonaSettings();

  // --- Local State ---
  // Initialized with empty defaults, hydrated once server data arrives
  const [formData, setFormData] = useState<PersonaSettings>({
    voice_name: "Aoede",
    assistant_name: "",
    welcome_message: "",
    system_instruction: "",
    temperature: 1.0,
  });

  const [isShowingPlayground, setIsShowingPlayground] = useState(false);

  /**
   * Sync server state to local form state.
   * We use a small timeout to ensure state transitions are smooth and
   * to avoid React rendering conflicts during batch updates.
   */
  useEffect(() => {
    if (settings) {
      const timer = setTimeout(() => {
        setFormData({
          voice_name: settings.voice_name || "Aoede",
          assistant_name: settings.assistant_name || "TrekDesk AI",
          welcome_message: settings.welcome_message || "",
          system_instruction: settings.system_instruction || "",
          temperature: settings.temperature ?? 1.0,
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [settings]);

  /**
   * Dispatches the update mutation to the backend.
   */
  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  // Render loading state with the brand spinner
  if (loading)
    return (
      <div className={styles.loaderContainer}>
        <Clock className="animate-spin" size={32} color="var(--primary)" />
      </div>
    );

  const voices = ["Aoede", "Puck", "Charon", "Cory", "Fenrir", "Hera"];

  return (
    <div className={styles.container}>
      {/* 
        Note: The page header (Title/Description) is managed by the 
        global Layout component to prevent redundancy.
      */}

      {/* --- Notification Center --- */}
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

      {/* --- Main Configuration Area --- */}
      <div className={styles.mainLayout}>
        {/* Left Side: Business & Identity Logic */}
        <div className={styles.configColumn}>
          <Card>
            <CardHeader>
              <CardTitle>Core Identity</CardTitle>
            </CardHeader>
            <CardContent>
              {/* AI Name Input */}
              <div className={styles.inputField}>
                <label className={styles.label}>Assistant Name</label>
                <input
                  type="text"
                  placeholder="e.g. TrekDesk Assistant"
                  value={formData.assistant_name}
                  onChange={(e) =>
                    setFormData({ ...formData, assistant_name: e.target.value })
                  }
                  className={styles.input}
                />
              </div>

              {/* Welcome Message Input */}
              <div className={styles.inputField}>
                <div className="flex-between">
                  <label className={styles.label}>
                    Greeting Themes & Instructions
                    <Info
                      size={14}
                      className="text-muted"
                      style={{ marginLeft: "8px", cursor: "help" }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Welcome users and mention we have new tours in Ella!"
                  value={formData.welcome_message}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      welcome_message: e.target.value,
                    })
                  }
                  className={styles.input}
                />
                <span
                  className="text-muted"
                  style={{
                    fontSize: "0.75rem",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  Provide key points or a tone (e.g., 'Be very energetic') for
                  the AI's first greeting.
                </span>
              </div>

              {/* Gemini Voice Picker */}
              <div className={styles.inputField}>
                <label className={styles.label}>Gemini Voice</label>
                <select
                  value={formData.voice_name}
                  onChange={(e) =>
                    setFormData({ ...formData, voice_name: e.target.value })
                  }
                  className={`${styles.input} ${styles.select}`}
                >
                  {voices.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              {/* Temperature Slider */}
              <div className={styles.inputField}>
                <div className={styles.rangeHeader}>
                  <label className={styles.label}>Temperature</label>
                  <span className={styles.rangeValue}>
                    {formData.temperature.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      temperature: parseFloat(e.target.value),
                    })
                  }
                  className={styles.rangeInput}
                />
                <div
                  className="flex-between text-muted"
                  style={{ fontSize: "0.7rem" }}
                >
                  <span>Deterministic</span>
                  <span>Creative</span>
                </div>
              </div>

              {/* System Prompt / Behavior Constraints */}
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

              {/* Save Trigger */}
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

          {/* Specialized Voice Configuration Playground */}
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

        {/* Right Side: Visual Real-time Preview */}
        <div className={styles.previewColumn}>
          <div
            className="flex items-center gap-sm"
            style={{ marginBottom: "1rem", justifyContent: "center" }}
          >
            <Badge variant="outline">Live Preview</Badge>
            <span className="text-muted" style={{ fontSize: "0.8rem" }}>
              Widget customer view
            </span>
          </div>

          <div className={styles.previewDevice}>
            {/* 
              Simulated iFrame using the actual Chat Widget endpoint.
              The persona state is injected via query parameters to allow 
              the preview to feel 'live' before saving.
            */}
            <iframe
              src={`/embed/chat?color=${encodeURIComponent(widgetSettings?.primary_color || "#10b981")}&msg=${encodeURIComponent(widgetSettings?.initial_message || "Hi! How can I help you today?")}&name=${encodeURIComponent(formData.assistant_name)}`}
              className={styles.previewFrame}
              title="Widget Preview"
            />
          </div>
        </div>
      </div>

      {/* Voice Selection Modal */}
      <VoicePlayground
        isOpen={isShowingPlayground}
        onClose={() => setIsShowingPlayground(false)}
      />
    </div>
  );
};

export default Persona;
