/**
 * @file VoicePlayground.tsx
 * @description A premium, modal-based laboratory for testing the AI's vocal persona.
 * Orchestrates multiple sub-components and the core useVoiceSession hook.
 */

import React, { useState, useEffect, useRef } from "react";
import { usePersonaSettings } from "../../persona/hooks/usePersona";
import { useVoiceSession } from "../hooks/useVoiceSession";

// Sub-components for better separation of concerns
import { VoiceModalHeader } from "./subcomponents/VoiceModalHeader";
import { VoiceStatusSettings } from "./subcomponents/VoiceStatusSettings";
import { VoiceTranscriptArea } from "./subcomponents/VoiceTranscriptArea";
import { VoiceControlFooter } from "./subcomponents/VoiceControlFooter";

import styles from "./VoicePlayground.module.css";

interface VoicePlaygroundProps {
  /** Controller state from the parent dashboard. */
  isOpen: boolean;
  /** Callback to hide the modal. */
  onClose: () => void;
}

/**
 * VoicePlayground
 *
 * Provides a "Studio" environment where admins can hear their AI persona live.
 * It is designed to feel high-end, utilizing micro-animations and status tracking.
 *
 * Logic Flow:
 * 1. Load the latest persona settings (database).
 * 2. Connect to the WebSocket backend via useVoiceSession.
 * 3. Handle live multimodal turns (audio input/output).
 * 4. Display a rolling transcript for visual feedback.
 */
export const VoicePlayground: React.FC<VoicePlaygroundProps> = ({
  isOpen,
  onClose,
}) => {
  // --- Data & State ---
  const { data: settings } = usePersonaSettings();
  const [hasGreeted, setHasGreeted] = useState(false);
  const [transcript, setTranscript] = useState<
    { type: "user" | "ai"; text: string }[]
  >([]);

  // --- Refs ---
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // --- Core Voice Logic ---
  const {
    status,
    isActive,
    isConnecting,
    isRecording,
    isAiSpeaking,
    isVADLoading,
    isThinking,
    error,
    startSession,
    endSession,
    toggleRecording,
  } = useVoiceSession({
    onStatusChange: (status) => {
      // Log connection events to the transcript area for clarity
      if (status === "Connected") {
        setTranscript([
          { type: "ai", text: "Secure link established. Assistant is ready." },
        ]);
      }
    },
    onGreetingReceived: () => setHasGreeted(true),
    // Map backend server turns back to the visual transcript
    onMessageReceived: (data: Record<string, unknown>) => {
      if (data?.parts && Array.isArray(data.parts)) {
        data.parts.forEach((p: { text?: string }) => {
          if (p.text) {
            setTranscript((prev) => [...prev, { type: "ai", text: p.text! }]);
          }
        });
      }
    },
  });

  /**
   * Auto-scroll behavior
   * Keeps the latest transcript messages visible as they arrive.
   */
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  /**
   * Safety Cleanup
   * Ensures the microphone and WebSocket are released immediately if
   * the user closes the modal during an active session.
   */
  useEffect(() => {
    if (!isOpen && isActive) {
      endSession();
    }
  }, [isOpen, isActive, endSession]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-label="Voice Studio"
    >
      <div className={styles.modalContent}>
        <VoiceModalHeader
          isActive={isActive}
          status={status}
          onClose={onClose}
        />

        <div className={styles.body}>
          <VoiceStatusSettings
            voiceName={settings?.voice_name}
            temperature={settings?.temperature}
          />

          <VoiceTranscriptArea
            transcript={transcript}
            isConnecting={isConnecting}
            isThinking={isThinking}
            error={error}
            transcriptEndRef={transcriptEndRef}
          />

          <VoiceControlFooter
            isActive={isActive}
            isConnecting={isConnecting}
            isRecording={isRecording}
            isAiSpeaking={isAiSpeaking}
            isVADLoading={isVADLoading}
            isThinking={isThinking}
            hasGreeted={hasGreeted}
            startSession={startSession}
            endSession={endSession}
            toggleRecording={toggleRecording}
          />
        </div>
      </div>
    </div>
  );
};

export default VoicePlayground;
