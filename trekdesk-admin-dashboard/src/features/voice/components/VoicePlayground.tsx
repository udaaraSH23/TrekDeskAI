import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Loader2,
  MessageSquare,
  Headphones,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { usePersonaSettings } from "../../persona/hooks/usePersona";
import { useVoiceSession } from "../hooks/useVoiceSession";

import styles from "./VoicePlayground.module.css";

interface VoicePlaygroundProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * VoicePlayground
 * A premium live sandbox to test the AI persona's voice and behavior.
 * Uses the shared useVoiceSession hook for multimodal interaction.
 */
export const VoicePlayground: React.FC<VoicePlaygroundProps> = ({
  isOpen,
  onClose,
}) => {
  const { data: settings } = usePersonaSettings();
  const [hasGreeted, setHasGreeted] = useState(false);
  const [transcript, setTranscript] = useState<
    { type: "user" | "ai"; text: string }[]
  >([]);

  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const {
    isActive,
    isConnecting,
    isRecording,
    isAiSpeaking,
    error,
    startSession,
    endSession,
    toggleRecording,
  } = useVoiceSession({
    onStatusChange: (status) => {
      if (status === "Connected") {
        setTranscript([
          { type: "ai", text: "Secure link established. Assistant is ready." },
        ]);
      }
    },
    onGreetingReceived: () => setHasGreeted(true),
  });

  // Auto-scroll to bottom of transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Ensure session ends when modal closes
  useEffect(() => {
    if (!isOpen && isActive) {
      endSession();
    }
  }, [isOpen, isActive, endSession]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* Header */}
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
                  {isActive ? "Connected" : "Offline"}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </header>

        {/* Body */}
        <div className={styles.body}>
          {/* Settings Bar */}
          <div className={styles.settingsBar}>
            <div className={styles.settingsItem}>
              <Headphones size={14} color="var(--primary)" />
              <span className={styles.settingsValue}>
                {settings?.voice_name || "Aoede"}
              </span>
            </div>
            <div className={styles.settingsItem}>
              <MessageSquare size={14} color="var(--primary)" />
              <span className={styles.settingsValue}>
                Temp: {settings?.temperature}
              </span>
            </div>
          </div>

          {/* Transcript Area */}
          <div className={styles.transcriptContainer}>
            {transcript.length === 0 && !isConnecting && (
              <div className={styles.emptyState}>
                <Volume2 size={48} color="rgba(255,255,255,0.05)" />
                <p>Start a session to begin testing your AI persona's voice.</p>
              </div>
            )}

            {transcript.map((msg, i) => (
              <div
                key={i}
                className={msg.type === "user" ? styles.userMsg : styles.aiMsg}
              >
                <div
                  className={`${styles.msgText} ${msg.type === "user" ? styles.userMsgText : styles.aiMsgText}`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isConnecting && (
              <div className={styles.connectingContainer}>
                <Loader2
                  className="animate-spin"
                  size={18}
                  color="var(--primary)"
                />
                <span className={styles.connectingText}>
                  Establishing secure link...
                </span>
              </div>
            )}

            {error && <div className={styles.errorBanner}>{error}</div>}
            <div ref={transcriptEndRef} />
          </div>

          {/* Controls - Fixed to bottom */}
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
                <div className={styles.visualizerContainer}>
                  {/* Animated Speaking Waves */}
                  {isAiSpeaking && (
                    <div className={styles.waveContainer}>
                      <div
                        className={styles.bar}
                        style={{ animationDelay: "0s" }}
                      />
                      <div
                        className={styles.bar}
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className={styles.bar}
                        style={{
                          animationDelay: "0.2s",
                          height: "100%",
                        }}
                      />
                      <div
                        className={styles.bar}
                        style={{ animationDelay: "0.3s" }}
                      />
                      <div
                        className={styles.bar}
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ position: "relative" }}>
                  <button
                    onClick={toggleRecording}
                    disabled={!hasGreeted && !isRecording}
                    className={`${styles.micButton} ${isRecording ? styles.micButtonRecording : styles.micButtonActive} ${!hasGreeted && !isRecording ? styles.micButtonDisabled : ""}`}
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
                  {!hasGreeted
                    ? "Waiting for greeting..."
                    : isRecording
                      ? "I'm Listening..."
                      : "Tap to Speak"}
                </p>

                <button
                  onClick={endSession}
                  className={styles.endSessionButton}
                >
                  End Session
                </button>
              </div>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
};

export default VoicePlayground;
