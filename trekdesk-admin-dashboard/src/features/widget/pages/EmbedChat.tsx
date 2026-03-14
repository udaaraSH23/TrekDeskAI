import React, { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { useVoiceSession } from "../../../features/voice/hooks/useVoiceSession";

import styles from "./EmbedChat.module.css";

const EmbedChat: React.FC = () => {
  // 1. Configuration from URL parameters
  const params = new URLSearchParams(window.location.search);
  const primaryColor = params.get("color") || "#10b981";
  const initialMsg = params.get("msg") || "Hi! How can I help you today?";

  // 2. Local UI State
  const [hasGreetingStarted, setHasGreetingStarted] = useState(false);
  const [status, setStatus] = useState<string>("Ready to talk");

  // 3. Multimodal Voice Session Hook
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
    onStatusChange: (statusText: string) => {
      // Map generic hook status to descriptive EmbedChat status
      if (statusText === "Connecting...") setStatus("Hailing Assistant...");
      else if (statusText === "Connected") setStatus("Handshaking...");
      else if (statusText === "Listening") setStatus("Listening...");
      else if (statusText === "Active") setStatus("Online");
    },
    onGreetingReceived: () => {
      setHasGreetingStarted(true);
      setStatus("Online");
    },
    onAiSpeakingStart: () => setStatus("Trek AI Speaking..."),
    onAiSpeakingEnd: () => setStatus("Online"),
    onError: (msg: string) => setStatus(msg),
  });

  // Ensure session ends when component unmounts
  useEffect(() => {
    return () => endSession();
  }, [endSession]);

  return (
    <div className={styles.container}>
      {/* Dynamic Background Effect */}
      <div
        className={styles.waveBackground}
        style={{ backgroundColor: primaryColor }}
      />

      {/* Header */}
      <header className={styles.headerContainer}>
        <div className={styles.badge}>
          <Sparkles size={12} color="white" />
          <span>Live Multimodal</span>
        </div>
        <h1 className={styles.headerTitle}>TrekDesk AI</h1>
      </header>

      {/* Main interaction Area */}
      <main className={styles.contentWrapper}>
        <div className={styles.statusWrapper}>
          {/* Central AI Sphere */}
          <div
            className={`${styles.sphereContainer} ${isAiSpeaking ? styles.sphereActive : styles.sphereInactive}`}
            style={{
              boxShadow: isAiSpeaking
                ? `0 0 50px ${primaryColor}`
                : "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            {isAiSpeaking ? (
              <div className={styles.voiceWaves}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={styles.waveBar}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            ) : isConnecting ? (
              <Loader2 className={styles.spin} size={40} color="white" />
            ) : (
              <Volume2
                size={40}
                color="white"
                style={{ opacity: isActive ? 1 : 0.3 }}
              />
            )}
          </div>

          <p className={styles.statusText}>{status}</p>
        </div>

        {/* Initial Prompting (Only if not active) */}
        {!isActive && !isConnecting && (
          <div className={styles.introScreen}>
            <p className={styles.welcomeDesc}>{initialMsg}</p>
            <button
              onClick={startSession}
              className={styles.primaryAction}
              style={{ backgroundColor: primaryColor }}
            >
              Start Voice Chat
            </button>
          </div>
        )}
      </main>

      {/* Controls Footer */}
      <footer className={styles.footer}>
        {isActive && (
          <div className={styles.controlsRow}>
            <button
              onClick={toggleRecording}
              disabled={!hasGreetingStarted}
              className={`${styles.micButton} ${isRecording ? styles.micButtonActive : styles.micButtonInactive}`}
              style={{
                backgroundColor: isRecording
                  ? primaryColor
                  : "rgba(255,255,255,0.1)",
                boxShadow: isRecording ? `0 0 20px ${primaryColor}` : "none",
                opacity: hasGreetingStarted ? 1 : 0.5,
                cursor: hasGreetingStarted ? "pointer" : "not-allowed",
              }}
            >
              {isRecording ? (
                <Mic size={24} color="white" />
              ) : (
                <MicOff size={24} color="#6b7280" />
              )}
            </button>
            <button onClick={endSession} className={styles.resetButton}>
              <RefreshCw size={18} />
            </button>
          </div>
        )}

        {error && (
          <p className={styles.statusSubtext} style={{ color: "#ef4444" }}>
            {error}
          </p>
        )}
      </footer>
    </div>
  );
};

export default EmbedChat;
