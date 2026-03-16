import React, { type RefObject } from "react";
import { Volume2, Loader2 } from "lucide-react";
import styles from "../VoicePlayground.module.css";

/**
 * Defines a single conversational turn in the transcript.
 * @interface Message
 */
interface Message {
  /** The origin of the message. */
  type: "user" | "ai";
  /** The text content transcribed or generated. */
  text: string;
}

/**
 * Props for the VoiceTranscriptArea component.
 * @interface VoiceTranscriptAreaProps
 */
interface VoiceTranscriptAreaProps {
  /** Ordered array of user and AI conversational turns. */
  transcript: Message[];
  /** Flag indicating if the underlying WebSocket is currently handshaking. */
  isConnecting: boolean;
  /** Flag indicating if the user has spoken and the AI is currently processing/generating a response. */
  isThinking: boolean;
  /** Fatal error message to display in the banner, if any. */
  error: string | null;
  /** A React ref attached to an empty bottom element to facilitate auto-scrolling to the latest message. */
  transcriptEndRef: RefObject<HTMLDivElement | null>;
}

/**
 * VoiceTranscriptArea
 *
 * Renders the primary text interface of the Voice Studio playground.
 * It handles the display of live conversational elements like user queries,
 * AI responses, system states (Connecting, Thinking), and error banners.
 *
 * It is structured to work tightly with an external `transcriptEndRef` to
 * ensure the user always sees the most recent text without manually scrolling.
 *
 * @component
 * @category Voice UI
 */
export const VoiceTranscriptArea: React.FC<VoiceTranscriptAreaProps> = ({
  transcript,
  isConnecting,
  isThinking,
  error,
  transcriptEndRef,
}) => (
  <div className={styles.transcriptContainer}>
    {/* Empty State: Only shown at startup before anything has happened. */}
    {transcript.length === 0 && !isConnecting && (
      <div className={styles.emptyState}>
        <Volume2 size={48} color="rgba(255,255,255,0.05)" />
        <p>Start a session to begin testing your AI persona's voice.</p>
      </div>
    )}

    {/* Message Feed: Chronological rendering of standard conversation turns. */}
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

    {/* Connection State: Intended to be overlaid or shown at the top logically; rendered at bottom currently. */}
    {isConnecting && (
      <div className={styles.connectingContainer}>
        <Loader2 className="animate-spin" size={18} color="var(--primary)" />
        <span className={styles.connectingText}>
          Establishing secure link...
        </span>
      </div>
    )}

    {/* Processing State: Shown exactly where the AI's *next* message will appear. */}
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

    {/* Global Error Banner */}
    {error && <div className={styles.errorBanner}>{error}</div>}

    {/* Auto-scroll Anchor Element */}
    <div ref={transcriptEndRef} />
  </div>
);
