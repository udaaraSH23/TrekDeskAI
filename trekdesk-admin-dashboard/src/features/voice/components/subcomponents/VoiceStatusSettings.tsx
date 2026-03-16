import React from "react";
import { Headphones, MessageSquare } from "lucide-react";
import styles from "../VoicePlayground.module.css";

/**
 * Props for the VoiceStatusSettings component.
 * @interface VoiceStatusSettingsProps
 */
interface VoiceStatusSettingsProps {
  /** The descriptive name of the AI's vocal avatar (e.g., 'Aoede', 'Puck'). */
  voiceName?: string;
  /** The creativity threshold configured for the interaction model. */
  temperature?: number;
}

/**
 * VoiceStatusSettings
 *
 * Displays the current persona configuration parameters that are actively
 * driving the voice session. This provides the admin with quick context
 * regarding what 'personality' they are currently testing.
 *
 * @component
 * @category Voice UI
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
