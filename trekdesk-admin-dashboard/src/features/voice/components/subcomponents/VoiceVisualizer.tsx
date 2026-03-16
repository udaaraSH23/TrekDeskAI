import React from "react";
import styles from "../VoicePlayground.module.css";

interface VoiceVisualizerProps {
  isAiSpeaking: boolean;
}

/**
 * Animated CSS visualizer representing AI vocal activity.
 */
export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  isAiSpeaking,
}) => (
  <div className={styles.visualizerContainer}>
    {isAiSpeaking && (
      <div className={styles.waveContainer}>
        <div className={styles.bar} style={{ animationDelay: "0s" }} />
        <div className={styles.bar} style={{ animationDelay: "0.1s" }} />
        <div
          className={styles.bar}
          style={{
            animationDelay: "0.2s",
            height: "100%",
          }}
        />
        <div className={styles.bar} style={{ animationDelay: "0.3s" }} />
        <div className={styles.bar} style={{ animationDelay: "0.4s" }} />
      </div>
    )}
  </div>
);
