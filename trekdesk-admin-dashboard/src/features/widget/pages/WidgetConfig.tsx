/**
 * @module WidgetConfig
 * @category Components
 *
 * Provides the administrative interface for managing the AI Chat Widget settings.
 * Includes branding, messaging, security, and integration script generation.
 */

import React, { useState, useEffect } from "react";
import {
  Code,
  Copy,
  Check,
  MessageSquare,
  Sparkles,
  Palette,
  Loader2,
  Shield,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import {
  useWidgetSettings,
  useUpdateWidgetSettings,
} from "../hooks/useWidgetSettings";

import styles from "./WidgetConfig.module.css";

/**
 * WidgetConfig Component
 *
 * The primary administrative interface for configuring the TrekDesk AI chat widget.
 * Allows tenants to customize visual branding, messaging, security (CORS),
 * and provides the generated script for website embedding.
 *
 * Features:
 * - Real-time preview of the widget in an iframe.
 * - Reactive form state for appearance and messaging.
 * - Domain-based security configuration.
 * - One-click clipboard copying for the integration script.
 *
 * @component
 */

const WidgetConfig: React.FC = () => {
  // --- 1. DATA FETCHING ---
  /** Fetch the current widget settings (color, greeting, etc.) */
  const { data: settings, isLoading } = useWidgetSettings();
  /** Mutation hook for updating widget settings */
  const updateMutation = useUpdateWidgetSettings();

  // --- 2. LOCAL STATE ---
  /** Feedback state for the 'Copy to Clipboard' action. Triggers a check icon for 2s. */
  const [copied, setCopied] = useState<boolean>(false);

  /**
   * Local form state holds the transient edits before saving.
   * Initialized with defaults that match the server schema.
   */
  const [formData, setFormData] = useState({
    primaryColor: "#10b981",
    agentName: "TrekDesk AI",
    welcomeMessage: "Hi! How can I help you today?",
    theme: "dark",
    position: "right",
    allowedOrigins: "",
  });

  /**
   * Ref used to ensure we only sync server data to local form once on initial load.
   * This prevents overwriting user's unsaved changes if the background query refetches.
   * @internal
   */
  const hasSynced = React.useRef<boolean>(false);

  /**
   * Sync initial data from the backend into the local form.
   * We use a timeout 0/useEffect pattern to ensure smooth transition from loading state.
   */
  useEffect(() => {
    if (settings && !hasSynced.current) {
      const timer = setTimeout(() => {
        setFormData({
          primaryColor: settings.primary_color || "#10b981",
          agentName: settings.agent_name || "TrekDesk AI",
          welcomeMessage:
            settings.initial_message || "Hi! How can I help you today?",
          theme: "dark",
          position: settings.position || "right",
          allowedOrigins: settings.allowed_origins
            ? settings.allowed_origins.join(", ")
            : "",
        });
        hasSynced.current = true;
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [settings]);

  /**
   * Persists the local form state to the database via the update mutation.
   * Converts the comma-separated domains string back into a sanitized array of strings.
   *
   * @internal
   */
  const handleSave = (): void => {
    updateMutation.mutate({
      primary_color: formData.primaryColor,
      agent_name: formData.agentName,
      initial_message: formData.welcomeMessage,
      position: formData.position as "left" | "right",
      allowed_origins: formData.allowedOrigins
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),
    });
  };

  /**
   * The actual <script> snippet the user needs to paste on their site.

   * Dynamically generated based on current (unsaved) form selections for instant preview.
   *
   * @internal
   */
  const widgetScript: string = `
<!-- TrekDesk AI Widget -->
<script src="${(import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1").replace("/api/v1", "")}/static/widget.v1.js"></script>
<script>
  window.TrekDeskAI.init({
    color: "${formData.primaryColor}",
    msg: "${formData.welcomeMessage}",
    position: "${formData.position}",
    name: "${formData.agentName}"
  });
</script>
  `.trim();

  /**
   * Copies the generated script to the system clipboard and triggers visual feedback.
   * @internal
   */
  const copyToClipboard = (): void => {
    navigator.clipboard.writeText(widgetScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Full-page loading state with animated spinner
  if (isLoading)
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
      </div>
    );

  return (
    <div className={styles.container}>
      {/* Toast-style Success Feedback bar positioned at the top of the viewport */}
      {updateMutation.isSuccess && (
        <div className={`${styles.alert} ${styles.alertSuccess}`}>
          <Check size={18} />
          <span>Widget settings updated successfully!</span>
        </div>
      )}

      <div className={styles.mainLayout}>
        {/* LEFT PANEL: Form Configuration & Embedding Instructions */}
        <div className={styles.configSection}>
          {/* Section: Visual Appearance (Color, Theme, Position) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-sm">
                <Palette size={18} color="var(--primary)" /> Appearance
              </CardTitle>
              <CardDescription>
                Customize the visual style of your widget
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-col gap-lg">
              {/* Color Picker with matched HEX text input */}
              <div className={styles.inputField}>
                <label className={styles.label}>Primary Brand Color</label>
                <div className={styles.colorPicker}>
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryColor: e.target.value })
                    }
                    className={styles.colorSwatch}
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryColor: e.target.value })
                    }
                    className={`${styles.input} ${styles.hexInput}`}
                  />
                </div>
              </div>

              {/* Assistant Name Input */}
              <div className={styles.inputField}>
                <label className={styles.label}>Assistant Name</label>
                <input
                  type="text"
                  value={formData.agentName}
                  onChange={(e) =>
                    setFormData({ ...formData, agentName: e.target.value })
                  }
                  className={styles.input}
                  placeholder="e.g. Trek Assistant"
                />
              </div>

              {/* Theme Selector (Currently restricted to Dark / Glassmorphism) */}
              <div className={styles.inputField}>
                <label className={styles.label}>Widget Theme</label>
                <div className="flex gap-sm">
                  <Button
                    variant={formData.theme === "dark" ? "primary" : "outline"}
                    onClick={() => setFormData({ ...formData, theme: "dark" })}
                    className="flex-1"
                  >
                    Dark (Glassmorphism)
                  </Button>
                  <Button
                    variant={formData.theme === "light" ? "primary" : "outline"}
                    className="flex-1"
                    disabled
                  >
                    Light (Coming Soon)
                  </Button>
                </div>
              </div>

              {/* Launcher Position Toggle: Controls where the chat button sits */}
              <div className={styles.inputField}>
                <label className={styles.label}>Widget Position</label>
                <div className="flex gap-sm">
                  <Button
                    variant={
                      formData.position === "left" ? "primary" : "outline"
                    }
                    onClick={() =>
                      setFormData({ ...formData, position: "left" })
                    }
                    className="flex-1"
                  >
                    Bottom Left
                  </Button>
                  <Button
                    variant={
                      formData.position === "right" ? "primary" : "outline"
                    }
                    onClick={() =>
                      setFormData({ ...formData, position: "right" })
                    }
                    className="flex-1"
                  >
                    Bottom Right
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section: Messaging Content (Welcome greeting) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-sm">
                <MessageSquare size={18} color="var(--primary)" /> Messaging
              </CardTitle>
              <CardDescription>
                Control the initial interaction experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.inputField}>
                <label className={styles.label}>Welcome Message</label>
                <textarea
                  value={formData.welcomeMessage}
                  onChange={(e) =>
                    setFormData({ ...formData, welcomeMessage: e.target.value })
                  }
                  className={`${styles.input} ${styles.welcomeTextarea}`}
                  placeholder="Greeting shown when a customer opens the widget"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section: Security/CORS Settings (Domain restriction) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-sm">
                <Shield size={18} color="var(--primary)" /> Security
              </CardTitle>
              <CardDescription>
                Restrict where your widget can be embedded
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.inputField}>
                <label className={styles.label}>Allowed Domains</label>
                <textarea
                  value={formData.allowedOrigins}
                  onChange={(e) =>
                    setFormData({ ...formData, allowedOrigins: e.target.value })
                  }
                  className={`${styles.input} ${styles.welcomeTextarea}`}
                  placeholder="e.g. https://example.com, https://app.example.com"
                />
                <p
                  className="text-muted text-sm"
                  style={{ fontSize: "0.8rem", marginTop: "8px" }}
                >
                  Enter comma-separated URLs starting with http:// or https://.
                  Leave blank to allow any domain, though this is not
                  recommended for production.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Action Bar */}
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className={`flex items-center gap-sm ${styles.saveButton}`}
            >
              <Sparkles size={16} />{" "}
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          {/* Integration Guide: Copy script and instructions */}
          <Card className={styles.embedCard}>
            <CardHeader>
              <CardTitle className="flex items-center gap-sm">
                <Code size={18} color="var(--primary)" /> Embed Script
              </CardTitle>
              <CardDescription>
                Add this code to your website to enable the TrekDesk AI
                Assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.scriptBox}>
                <pre className={styles.scriptCode}>{widgetScript}</pre>
                <button
                  className={styles.copyButton}
                  onClick={copyToClipboard}
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check size={16} color="#10b981" />
                  ) : (
                    <Copy size={16} color="white" />
                  )}
                </button>
              </div>

              <div className={styles.stepsList}>
                <div className={styles.stepItem}>
                  <div className={styles.stepNumber}>1</div>
                  <p className={styles.stepText}>
                    Copy the script above and paste it before the{" "}
                    <code>&lt;/body&gt;</code> tag on your website.
                  </p>
                </div>
                <div className={styles.stepItem}>
                  <div className={styles.stepNumber}>2</div>

                  <p className={styles.stepText}>
                    The widget will automatically initialize with your brand
                    colors and welcome message.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL: LIVE PREVIEW IFRAME */}
        <div className={styles.previewSection}>
          <div className={styles.previewLabel}>
            <Sparkles size={14} /> Live Assistant Preview
          </div>
          <div className={styles.previewFrameWrapper}>
            {/* 
                The iframe points to the internal /embed/chat route with configuration passed
                as query parameters. This ensures the preview is always in sync with unsaved edits.
            */}
            <iframe
              src={`/embed/chat?color=${encodeURIComponent(formData.primaryColor)}&msg=${encodeURIComponent(formData.welcomeMessage)}&position=${formData.position}&name=${encodeURIComponent(formData.agentName)}&apiUrl=${encodeURIComponent(import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1")}`}
              className={styles.previewIframe}
              title="Widget Preview"
              allow="microphone; autoplay"
            />
          </div>
          <p className={styles.previewNote}>
            This is how your voice-enabled AI assistant will appear to your
            customers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WidgetConfig;
