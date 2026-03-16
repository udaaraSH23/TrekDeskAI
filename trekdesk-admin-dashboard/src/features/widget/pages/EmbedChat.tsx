/**
 * @module EmbedChat
 * @category Components
 *
 * This component provides the customer-facing voice chat interface.
 * It is intended to be loaded within an iframe on third-party websites.
 */

import React, { useEffect } from "react";
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

/**
 * EmbedChat Component
 *
 * A specialized view designed to be embedded as an iframe on customer websites.
 * It provides a "Live Multimodal" voice interaction experience with an AI assistant.
 *
 * Features:
 * - Real-time voice session management via 'useVoiceSession'.
 * - Dynamic UI themes based on brand colors passed via URL.
 * - Glassmorphism-based futuristic design with animated voice waves.
 * - Automatic cleanup of voice sessions on unmount.
 *
 * @component
 */
const EmbedChat: React.FC = () => {
  // --- 1. CONFIGURATION & CUSTOMIZATION ---
  // The layout and initial behavior are driven by URL parameters provided by the host script.
  const params = React.useMemo(
    () => new URLSearchParams(window.location.search),
    [],
  );

  /**
   * The primary brand color (HEX) for buttons, waves, and shadows.
   * Defaults to TrekDesk Emerald if not specified.
   */
  const primaryColor: string = params.get("color") || "#10b981";

  /**
   * The greeting message displayed before the user starts the session.
   */
  const initialMsg: string =
    params.get("msg") || "Hi! How can I help you today?";

  /**
   * The name of the AI persona as configured in the admin dashboard.
   */
  const assistantName: string = params.get("name") || "TrekDesk AI";

  // --- 2. UI STATE ---
  // --- 2. UI STATE ---
  // Note: hasFinishedInitialGreeting is managed by useVoiceSession

  // --- 3. VOICE SESSION LOGIC ---
  const voiceOptions = React.useMemo(
    () => ({
      /** Updates the status text based on the connection phase. */
      onStatusChange: () => {
        // Status is handled via reactive hooks in the UI
      },
      /** Triggers the wave animation. */
      onAiSpeakingStart: () => {
        // Handled via isAiSpeaking
      },
      /** Stops the wave animation. */
      onAiSpeakingEnd: () => {
        // Handled via isAiSpeaking
      },
      /** Displays fatal errors to the user. */
      onError: () => {
        // Handled via error state
      },
    }),
    [],
  );

  const {
    isActive,
    isConnecting,
    isRecording,
    isAiSpeaking,
    isThinking,
    hasFinishedInitialGreeting,
    error,
    startSession,
    endSession,
    toggleRecording,
  } = useVoiceSession(voiceOptions);

  /**
   * Lifecycle management:
   * Ensures that if the user closes the widget or navigates away,
   * the microphone and streaming connections are properly terminated.
   */
  useEffect(() => {
    return () => {
      endSession();
    };
  }, [endSession]);

  return (
    <div className={styles.container}>
      {/* 
          Background overlay with the brand's primary color. 
          Uses a subtle fade/blur style defined in CSS.
      */}
      <div
        className={styles.waveBackground}
        style={{ backgroundColor: primaryColor }}
      />

      {/* Header Branding */}
      <header className={styles.headerContainer}>
        <div className={styles.badge}>
          <Sparkles size={12} color="white" />
          <span>Live Multimodal</span>
        </div>
      </header>

      {/* Main Experience: Central Sphere and Status */}
      <main className={styles.contentWrapper}>
        <div className={styles.statusWrapper}>
          <h1 className={styles.headerTitle}>{assistantName}</h1>

          {/* 
              Central AI Sphere: Visualizes the AI's "brain" and activity.
              - Pulses and shows waves when AI is speaking.
              - Shows a loader when connecting.
              - Becomes translucent when inactive.
          */}
          <div
            className={`${styles.sphereContainer} ${isAiSpeaking ? styles.sphereActive : styles.sphereInactive} ${isThinking ? styles.sphereThinking : ""}`}
            style={{
              boxShadow: isAiSpeaking
                ? `0 0 50px ${primaryColor}`
                : isThinking
                  ? `0 0 30px ${primaryColor}80`
                  : "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            {isAiSpeaking ? (
              /* Animated equalizer bars representing AI voice modulation */
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

          <p className={styles.statusText}>
            {isConnecting ? "Stabilizing Link..." : "Online"}
          </p>

          {isThinking && (
            <div className={styles.thinkingIndicator}>
              <div className={styles.thinkingDot} />
              <div
                className={styles.thinkingDot}
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className={styles.thinkingDot}
                style={{ animationDelay: "0.4s" }}
              />
            </div>
          )}
        </div>

        {/* 
            Intro Screen: Shown before the session starts.
            Allows the user to read the welcome message before using the mic.
        */}
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

      {/* 
          Controls Footer:
          Contains Mic toggle and Session reset. Only visible after connection.
      */}
      <footer className={styles.footer}>
        {isActive && (
          <div className={styles.activeControlsGroup}>
            <div className={styles.controlsRow}>
              {/* Mic Toggle Button */}
              <button
                onClick={toggleRecording}
                disabled={!hasFinishedInitialGreeting}
                className={`${styles.micButton} ${
                  !hasFinishedInitialGreeting
                    ? styles.micButtonDisabled
                    : isRecording
                      ? styles.micButtonRecording
                      : styles.micButtonActive
                }`}
                style={{
                  backgroundColor:
                    isRecording && hasFinishedInitialGreeting
                      ? "#ef4444"
                      : hasFinishedInitialGreeting
                        ? primaryColor
                        : "rgba(255,255,255,0.1)",
                  boxShadow:
                    isRecording && hasFinishedInitialGreeting
                      ? "0 0 20px #ef4444"
                      : "none",
                }}
                title={
                  !hasFinishedInitialGreeting
                    ? "Waiting for greeting..."
                    : isRecording
                      ? "Stop Recording"
                      : "Start Recording"
                }
              >
                {isRecording && hasFinishedInitialGreeting ? (
                  <MicOff size={24} color="white" />
                ) : (
                  <Mic
                    size={24}
                    color={hasFinishedInitialGreeting ? "white" : "#4b5563"}
                  />
                )}
              </button>

              {/* Reset/End Session Button */}
              <button
                onClick={endSession}
                className={styles.resetButton}
                title="End Session"
              >
                <RefreshCw size={24} />
              </button>
            </div>

            {/* Status Feedback below the Mic */}
            <div
              className={`${styles.footerStatus} ${
                isRecording
                  ? styles.statusRecording
                  : !hasFinishedInitialGreeting || isAiSpeaking || isThinking
                    ? styles.statusSpeaking
                    : styles.statusOnline
              }`}
            >
              {isThinking
                ? "Thinking..."
                : isAiSpeaking
                  ? "Trek AI Speaking..."
                  : !hasFinishedInitialGreeting
                    ? "Waiting for greeting..."
                    : isRecording
                      ? "I'm Listening..."
                      : "Tap to Speak"}
            </div>
          </div>
        )}

        {/* Floating Error Bar */}
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
