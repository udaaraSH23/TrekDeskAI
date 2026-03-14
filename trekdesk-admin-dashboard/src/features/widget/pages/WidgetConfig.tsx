import React, { useState, useEffect } from "react";
import {
  Code,
  Copy,
  Check,
  Layout,
  MessageSquare,
  Sparkles,
  Palette,
  Eye,
  Clock,
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

const WidgetConfig: React.FC = () => {
  const { data: settings, isLoading } = useWidgetSettings();
  const updateMutation = useUpdateWidgetSettings();

  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    primaryColor: "#10b981",
    welcomeMessage: "Hi! How can I help you today?",
    theme: "dark",
  });
  const hasSynced = React.useRef(false);

  useEffect(() => {
    if (settings && !hasSynced.current) {
      // Use a timeout to avoid cascading render warning while syncing async settings to local state
      const timer = setTimeout(() => {
        setFormData({
          primaryColor: settings.primary_color || "#10b981",
          welcomeMessage:
            settings.initial_message || "Hi! How can I help you today?",
          theme: "dark",
        });
        hasSynced.current = true;
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [settings]);

  const handleSave = () => {
    updateMutation.mutate({
      primary_color: formData.primaryColor,
      initial_message: formData.welcomeMessage,
    });
  };

  const widgetScript = `
<!-- TrekDesk AI Widget -->
<script src="${(import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1").replace("/api/v1", "")}/static/widget.v1.js"></script>
<script>
  window.TrekDeskAI.init({
    color: "${formData.primaryColor}",
    msg: "${formData.welcomeMessage}"
  });
</script>
  `.trim();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(widgetScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading)
    return (
      <div className={styles.loadingContainer}>
        <Clock className="animate-spin" size={32} color="var(--primary)" />
      </div>
    );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className="flex items-center gap-sm">
          <div className={styles.iconBox}>
            <Layout size={24} color="var(--primary)" />
          </div>
          <div>
            <h1 className={styles.headerTitle}>Widget Configuration</h1>
            <p className={`text-muted ${styles.headerSubtitle}`}>
              Customize the TrekDesk AI widget and get the installation script.
            </p>
          </div>
        </div>
      </header>

      {updateMutation.isSuccess && (
        <div className={`${styles.alert} ${styles.alertSuccess}`}>
          <Check size={18} />
          <span>Widget settings updated successfully!</span>
        </div>
      )}

      <div className={styles.mainLayout}>
        {/* Left Side: Configuration */}
        <div className={styles.configSection}>
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
                    onClick={() => setFormData({ ...formData, theme: "light" })}
                    className="flex-1"
                  >
                    Light (Coming Soon)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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
        </div>

        {/* Right Side: Deployment */}
        <div className={styles.previewContainer}>
          <Card className={styles.embedCard}>
            <CardHeader>
              <CardTitle className="flex items-center gap-sm">
                <Code size={18} /> Embed Script
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.scriptBox}>
                <pre className={styles.scriptCode}>{widgetScript}</pre>
                <button
                  className={`p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors ${styles.copyButton}`}
                  onClick={copyToClipboard}
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
                <div className={styles.stepItem}>
                  <div className={styles.stepNumber}>3</div>
                  <p className={styles.stepText}>
                    Any changes you save here will be reflected instantly on
                    your live site.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-sm">
                <Eye size={18} /> Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.previewFrameWrapper}>
                <iframe
                  src={`/embed/chat?color=${encodeURIComponent(formData.primaryColor)}&msg=${encodeURIComponent(formData.welcomeMessage)}`}
                  className={styles.previewIframe}
                  title="Widget Preview"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WidgetConfig;
