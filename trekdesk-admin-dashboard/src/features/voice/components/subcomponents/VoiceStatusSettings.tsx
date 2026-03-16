import React from "react";
import { Headphones, MessageSquare } from "lucide-react";
import styles from "../VoicePlayground.module.css";

interface VoiceStatusSettingsProps {
  voiceName?: string;
  temperature?: number;
}

/**
 * Displays the current persona settings (voice name, temperature)
 * that are active in the session.
 */
export const VoiceStatusSettings: React.FC<VoiceStatusSettingsProps> = ({
  voiceName,
  temperature,
}) => (
  <div className={styles.settingsBar}>
    <div className={styles.settingsItem}>
      <Headphones size={14} color="var(--primary)" />
      <span className={styles.settingsValue}>{voiceName || "Aoede"}</span>
    </div>
    <div className={styles.settingsItem}>
      <MessageSquare size={14} color="var(--primary)" />
      <span className={styles.settingsValue}>Temp: {temperature ?? 0.7}</span>
    </div>
  </div>
);
