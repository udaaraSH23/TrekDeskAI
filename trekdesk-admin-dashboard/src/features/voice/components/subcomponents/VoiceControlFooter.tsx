import React from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { VoiceVisualizer } from "./VoiceVisualizer";
import styles from "../VoicePlayground.module.css";

/**
 * Props for the VoiceControlFooter component.
 * @interface VoiceControlFooterProps
 */
interface VoiceControlFooterProps {
  /** Indicates if the full secure connection is actively maintained. */
  isActive: boolean;
  /** True while the initial WebSocket handshake or authentication is occurring. */
  isConnecting: boolean;
  /** True when the microphone is unmuted and the VAD is actively listening to the user. */
  isRecording: boolean;
  /** True when the `PlaybackEngine` is currently streaming AI vocal output to the speakers. */
  isAiSpeaking: boolean;
  /** True while the raw required VAD assets (ONNX/WASM) are being fetched and parsed into memory. */
  isVADLoading: boolean;
  /** True after the user finishes speaking, before the first chunk of AI response is received. */
  isThinking: boolean;
  /** A strict gate that enforces the AI must finish its initial greeting before the user can interrupt or speak. */
  hasGreeted: boolean;
  /** Callback to trigger the hardware boot sequence and WebSocket connection attempt. */
  startSession: () => void;
  /** Callback to forcefully tear down the connection and hardware instances, resetting to idle. */
  endSession: () => void;
  /** Callback that toggles the `pause`/`start` behavior of the Silero VAD without dropping the WebSocket. */
  toggleRecording: () => void;
}

/**
 * VoiceControlFooter
 *
 * Renders the primary action nexus for the Voice Studio playground.
 * It manages the complex conditional logic required to display:
 * 1. The initial "Launch Session" button.
 * 2. The central glowing microphone toggle button (handling barge-in and muting).
 * 3. Human-readable subtext detailing the exact micro-state of the session.
 * 4. Disconnect controls.
 *
 * It is highly responsive to the top-level orchestration states provided by `useVoiceSession`.
 *
 * @component
 * @category Voice UI
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
    {/* Phase 1: Pre-Connection State */}
    {!isActive ? (
      <Button
        onClick={startSession}
        isLoading={isConnecting}
        className={styles.startButton}
      >
        Launch Live Session
      </Button>
    ) : (
      /* Phase 2: Active Connection State */
      <div className={styles.activeControlsGroup}>
        {/* Render CSS wave animation directly above the mic button when the AI is talking */}
        <VoiceVisualizer isAiSpeaking={isAiSpeaking} />

        <div style={{ position: "relative" }}>
          {/* Main Microphone Action Toggle */}
          <button
            onClick={toggleRecording}
            // Strict enforcement: The UI disables the mic physically until the greeting completes
            disabled={!hasGreeted}
            className={`${styles.micButton} ${isRecording ? styles.micButtonRecording : styles.micButtonActive}`}
            style={{
              opacity: hasGreeted ? 1 : 0.5,
              cursor: hasGreeted ? "pointer" : "not-allowed",
            }}
            title={
              !hasGreeted
                ? "Waiting for greeting..."
                : isRecording
                  ? "Stop Recording"
                  : "Start Recording"
            }
          >
            {isRecording ? (
              <MicOff size={32} color="white" />
            ) : (
              <Mic size={32} color="white" />
            )}

            {/* Visual pulse ring when mic is 'hot' */}
            {isRecording && <div className={styles.pulseRing} />}
          </button>
        </div>

        {/* Dynamic Contextual Subtext Feed */}
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

        {/* Emergency/Manual Disconnect Action */}
        <button onClick={endSession} className={styles.endSessionButton}>
          End Session
        </button>
      </div>
    )}
  </footer>
);
