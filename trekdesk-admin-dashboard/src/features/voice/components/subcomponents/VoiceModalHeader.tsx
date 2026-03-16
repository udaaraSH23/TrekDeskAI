import React from "react";
import { X, Sparkles } from "lucide-react";
import styles from "../VoicePlayground.module.css";

interface VoiceModalHeaderProps {
  isActive: boolean;
  status: string;
  onClose: () => void;
}

/**
 * Header component for the Voice Studio modal.
 * Displays the title, an animated spark icon, and connection status.
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
