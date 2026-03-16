import React, { type RefObject } from "react";
import { Volume2, Loader2 } from "lucide-react";
import styles from "../VoicePlayground.module.css";

interface Message {
  type: "user" | "ai";
  text: string;
}

interface VoiceTranscriptAreaProps {
  transcript: Message[];
  isConnecting: boolean;
  isThinking: boolean;
  error: string | null;
  transcriptEndRef: RefObject<HTMLDivElement | null>;
}

/**
 * Renders the live text transcript or empty states.
 * Automatically handles auto-scrolling via the passed ref.
 */
export const VoiceTranscriptArea: React.FC<VoiceTranscriptAreaProps> = ({
  transcript,
  isConnecting,
  isThinking,
  error,
  transcriptEndRef,
}) => (
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
        <Loader2 className="animate-spin" size={18} color="var(--primary)" />
        <span className={styles.connectingText}>
          Establishing secure link...
        </span>
      </div>
    )}

    {isThinking && (
      <div className={styles.aiMsg}>
        <div
          className={`${styles.msgText} ${styles.aiMsgText} ${styles.thinkingBox}`}
        >
          <Loader2 className="animate-spin" size={14} />
          <span>Thinking...</span>
        </div>
      </div>
    )}

    {error && <div className={styles.errorBanner}>{error}</div>}
    <div ref={transcriptEndRef} />
  </div>
);
