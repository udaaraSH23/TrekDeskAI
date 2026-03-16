import React from "react";
import { X, Sparkles } from "lucide-react";
import styles from "../VoicePlayground.module.css";

/**
 * Props for the VoiceModalHeader component.
 * @interface VoiceModalHeaderProps
 */
interface VoiceModalHeaderProps {
  /** True if the WebSocket and VAD are actively linked and ready. */
  isActive: boolean;
  /** Human-readable string representing the current state machine phase (e.g., 'connecting', 'active', 'error'). */
  status: string;
  /** Callback triggered when the 'X' button is clicked to close the playground modal. */
  onClose: () => void;
}

/**
 * VoiceModalHeader
 *
 * Renders the top bar of the Voice Studio playground modal.
 * Features title branding, an animated spark, and a dynamic status indicator
 * dot that changes color based on real-time connection telemetry.
 *
 * @component
 * @category Voice UI
 */
export const VoiceModalHeader: React.FC<VoiceModalHeaderProps> = ({
  isActive,
  status,
  onClose,
}) => (
  <header className={styles.modalHeader}>
    <div className="flex items-center gap-md">
      <div className={styles.iconBadge}>
        <Sparkles size={18} color="white" />
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
          Voice Studio
        </h2>
        <div className={styles.statusDotContainer}>
          <div
            className={styles.statusDot}
            style={{
              backgroundColor: isActive ? "#10b981" : "#6b7280",
            }}
          />
          <span className="text-muted" style={{ fontSize: "0.75rem" }}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>
    </div>
    <button onClick={onClose} className={styles.closeButton}>
      <X size={20} />
    </button>
  </header>
);
