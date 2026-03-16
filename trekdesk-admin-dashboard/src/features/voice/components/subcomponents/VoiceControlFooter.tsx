import React from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { VoiceVisualizer } from "./VoiceVisualizer";
import styles from "../VoicePlayground.module.css";

interface VoiceControlFooterProps {
  isActive: boolean;
  isConnecting: boolean;
  isRecording: boolean;
  isAiSpeaking: boolean;
  isVADLoading: boolean;
  isThinking: boolean;
  hasGreeted: boolean;
  startSession: () => void;
  endSession: () => void;
  toggleRecording: () => void;
}

/**
 * Footer area containing the primary action buttons:
 * Session Start/End, Microphone toggle, and the speaking visualizer.
 */
export const VoiceControlFooter: React.FC<VoiceControlFooterProps> = ({
  isActive,
  isConnecting,
  isRecording,
  isAiSpeaking,
  isVADLoading,
  isThinking,
  hasGreeted,
  startSession,
  endSession,
  toggleRecording,
}) => (
  <footer className={styles.controlsArea}>
    {!isActive ? (
      <Button
        onClick={startSession}
        isLoading={isConnecting}
        className={styles.startButton}
      >
        Launch Live Session
      </Button>
    ) : (
      <div className={styles.activeControlsGroup}>
        <VoiceVisualizer isAiSpeaking={isAiSpeaking} />

        <div style={{ position: "relative" }}>
          <button
            onClick={toggleRecording}
            className={`${styles.micButton} ${isRecording ? styles.micButtonRecording : styles.micButtonActive}`}
            title={isRecording ? "Stop Recording" : "Start Recording"}
          >
            {isRecording ? (
              <MicOff size={32} color="white" />
            ) : (
              <Mic size={32} color="white" />
            )}
            {isRecording && <div className={styles.pulseRing} />}
          </button>
        </div>

        <p
          className={`${styles.statusText} ${isRecording ? styles.statusTextRecording : styles.statusTextActive}`}
        >
          {isVADLoading ? (
            <span className={styles.syncingText}>Syncing Voice Model...</span>
          ) : isThinking ? (
            <span className={styles.syncingText}>Thinking...</span>
          ) : !hasGreeted ? (
            "Waiting for greeting..."
          ) : isRecording ? (
            "I'm Listening..."
          ) : (
            "Tap to Speak"
          )}
        </p>

        <button onClick={endSession} className={styles.endSessionButton}>
          End Session
        </button>
      </div>
    )}
  </footer>
);
