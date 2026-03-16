import React from "react";
import styles from "../VoicePlayground.module.css";

/**
 * Props for the VoiceVisualizer component.
 * @interface VoiceVisualizerProps
 */
interface VoiceVisualizerProps {
  /** Flag determining if the wave animation should be rendered and active. */
  isAiSpeaking: boolean;
}

/**
 * VoiceVisualizer
 *
 * A purely CSS-driven animation component that provides visual
 * feedback when the AI is speaking. It avoids expensive canvas or WebGL
 * calculations in favor of a lightweight DOM/CSS approach.
 *
 * Features:
 * - Uses staggered `animationDelay` on pure div elements to create a natural "wave" effect.
 * - Entirely declarative; does not parse live frequency data.
 *
 * @component
 * @category Voice UI
 */
export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  isAiSpeaking,
}) => (
  <div className={styles.visualizerContainer}>
    {isAiSpeaking && (
      /* 
         The wave container holds 5 symmetrical bars.
         The middle bar always hits 100% height, while the outer bars
         animate with staggered delays to simulate frequency modulation.
      */
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
