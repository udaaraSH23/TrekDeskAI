import { useState, useCallback, useRef, useEffect } from "react";
import { useVAD } from "./useVAD";
import { useAudioPlayback } from "./useAudioPlayback";
import { AudioStreamService } from "../services/AudioStreamService";
import { float32ToBase64 } from "../utils/audioUtils";

/**
 * Configuration options for the Voice Session orchestrator.
 * @interface VoiceSessionOptions
 */
export interface VoiceSessionOptions {
  /** Callback fired when the AI transitions from silent to speaking. */
  onAiSpeakingStart?: () => void;
  /** Callback fired when the AI concludes its current vocal response. */
  onAiSpeakingEnd?: () => void;
  /** Callback for UI telemetry to track connection state changes. */
  onStatusChange?: (status: string) => void;
  /** Callback fired specifically when the initial greeting is received from the server. */
  onGreetingReceived?: () => void;
  /** Callback for inspecting raw telemetry/transcript data from the Multimodal API. */
  onMessageReceived?: (data: Record<string, unknown>) => void;
  /** Global error handler for connection or hardware access failures. */
  onError?: (error: string) => void;
  /** Optional override for the backend WebSocket endpoint. */
  apiUrl?: string;
}

/** Represents the high-level connection continuum of the session. */
export type SessionStatus = "idle" | "connecting" | "active" | "error";

/**
 * useVoiceSession
 *
 * The Top-Level Orchestrator pattern for the Live Multimodal interaction model.
 * It serves as the "brain" of the client, bridging three distinct capability layers:
 * 1. Listening (Silero VAD - Voice Activity Detection)
 * 2. Processing (AudioStreamService - WebSocket integration)
 * 3. Speaking (AudioPlayback & PlaybackEngine)
 *
 * It enforces complex interaction rules, such as preventing the user from interrupting
 * the AI's initial greeting, and handles secure context/hardware permission flows.
 *
 * @category Hooks
 * @module useVoiceSession
 */
export const useVoiceSession = (options: VoiceSessionOptions = {}) => {
  // --- 1. STATE MANAGEMENT ---
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * A critical state gate. It prevents the user's microphone from sending data
   * until the AI has completely finished delivering its first "Welcome" message.
   */
  const [hasFinishedInitialGreeting, setHasFinishedInitialGreeting] =
    useState(false);

  // Stable reference to options to prevent infinite render loops in useEffects
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  /** Reference to the active WebSocket tunnel. */
  const streamServiceRef = useRef<AudioStreamService | null>(null);

  /** Timestamp used to calculate if enough time has passed to classify an interruption as intentional. */
  const aiStartedAtRef = useRef<number>(0);
  /** Flag used to track whether the AI has commenced speaking its initial greeting. */
  const aiGreetingStartedRef = useRef(false);

  // --- 2. LAYER REGISTRATION: AUDIO PLAYBACK (AI SPEAKING) ---
  const { isAiSpeaking, playAudio, stopAudio, resumeAudio } = useAudioPlayback({
    onAiSpeakingStart: () => {
      // Record the exact time the AI started speaking to calibrate interruption sensitivity.
      aiStartedAtRef.current = Date.now();
      aiGreetingStartedRef.current = true;
      setIsThinking(false);
      optionsRef.current.onAiSpeakingStart?.();
    },
    onAiSpeakingEnd: () => {
      // Natural progression: If the AI finishes speaking and the greeting was playing, unlock the mic.
      if (!hasFinishedInitialGreeting && aiGreetingStartedRef.current) {
        setHasFinishedInitialGreeting(true);
      }
      optionsRef.current.onAiSpeakingEnd?.();
    },
  });

  // --- 3. LAYER REGISTRATION: VOICE ACTIVITY DETECTION (USER SPEAKING) ---
  const { isVADLoading, isRecording, startVAD, pauseVAD, destroyVAD } = useVAD({
    onSpeechStart: () => {
      // Interruption Logic (Barge-in):
      // Only permit barge-in if the session has progressed past the initial greeting phase.
      if (hasFinishedInitialGreeting && aiStartedAtRef.current > 0) {
        // Prevent hyper-sensitive micro-interruptions (e.g., breath noises) by requiring
        // the AI to have been speaking for at least 400ms before it can be cut off.
        const timeSinceAiStarted = Date.now() - aiStartedAtRef.current;
        if (timeSinceAiStarted > 400) {
          stopAudio(); // Silence local playback immediately
          streamServiceRef.current?.sendStop(); // Instruct the server to halt generation
          aiStartedAtRef.current = 0; // Reset interruption timing
        }
      }
    },
    onSpeechEnd: () => {
      // Provide visual feedback ("Thinking...") once the user finishes a sentence,
      // but only if the session is fully active.
      if (hasFinishedInitialGreeting) {
        setIsThinking(true);
      }
    },
    onMisfire: () => {
      // If the VAD detects sound but determines it wasn't speech (e.g., a cough),
      // cancel the "Thinking..." visual state.
      setIsThinking(false);
    },
    onFrameProcessed: (_probs, frame) => {
      // Audio Suppression Logic:
      // We physically block the transmission of audio buffers to the server
      // while the initial greeting is playing, preventing cross-talk or echo loops.
      if (hasFinishedInitialGreeting && streamServiceRef.current?.isConnected) {
        const base64Audio = float32ToBase64(frame);
        streamServiceRef.current.sendAudio(base64Audio);
      }
    },
  });

  // --- 4. LIFECYCLE MANAGEMENT ---

  /**
   * Resets all sub-systems to their idle state and gracefully closes connections.
   */
  const cleanup = useCallback(async () => {
    stopAudio();
    streamServiceRef.current?.disconnect();
    await destroyVAD();

    setStatus("idle");
    setIsThinking(false);
    setError(null);
    setHasFinishedInitialGreeting(false);
    aiGreetingStartedRef.current = false;
    aiStartedAtRef.current = 0;
  }, [destroyVAD, stopAudio]);

  /**
   * Orchestrates the complex startup sequence:
   * 1. Validates environment (HTTPS requirement).
   * 2. Bootstraps hardware (Mic & WebAudio) within the user's click interaction.
   * 3. Establishes the secure WebSocket bridge.
   */
  const startSession = useCallback(async () => {
    setStatus("connecting");
    setError(null);
    optionsRef.current.onStatusChange?.("Connecting...");

    try {
      // The browser's MediaDevices API explicitly requires HTTPS or localhost.
      if (!window.isSecureContext) {
        throw new Error(
          "Microphone access requires a secure context (HTTPS or localhost).",
        );
      }

      // Step 1: Initialize Audio contexts immediately within the user-gesture window
      await resumeAudio();

      // Step 2: Request microphone permissions and spin up the VAD engine.
      // Doing this *before* awaiting the websocket connection ensures the browser doesn't
      // drop the user-gesture privilege.
      await startVAD();

      // Step 3: Compute robust connection URI
      const baseUrl =
        optionsRef.current.apiUrl ||
        import.meta.env.VITE_API_URL ||
        "http://localhost:3001";
      // Convert standard HTTP origin to secure WebSocket origin
      const wsUrl = baseUrl.replace("http", "ws").replace("/api/v1", "");

      const stream = new AudioStreamService(wsUrl);
      streamServiceRef.current = stream;

      stream.onOpen = () => {
        setStatus("active");
        optionsRef.current.onStatusChange?.("Connected");
      };

      stream.onMessage = (data) => {
        optionsRef.current.onMessageReceived?.(data);

        // Parse the nested data structure returned by the Gemini Multimodal Live API
        const parts = data.parts;
        if (Array.isArray(parts)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          parts.forEach((part: any) => {
            if (part.inlineData?.mimeType?.includes("audio")) {
              optionsRef.current.onGreetingReceived?.();
              // Push the raw base64 frame into the local playback engine
              playAudio(part.inlineData.data);
            }
          });
        }
      };

      stream.onError = (msg) => {
        setError(msg);
        optionsRef.current.onError?.(msg);
        cleanup();
      };

      stream.onClose = () => cleanup();

      // Final Step: Establish tunnel
      stream.connect();
    } catch (err: unknown) {
      console.error("Session Start Error:", err);
      const msg = err instanceof Error ? err.message : "Failed to connect";
      setError(msg);
      optionsRef.current.onError?.(msg);
      setStatus("error");
      cleanup();
    }
  }, [cleanup, playAudio, resumeAudio, startVAD]);

  return {
    /** High-level state machine string. */
    status,
    /** Derived boolean for UI logic. */
    isActive: status === "active",
    /** Derived boolean for UI loading states. */
    isConnecting: status === "connecting",
    /** True if the microphone is unmuted and the VAD is actively listening. */
    isRecording,
    /** True if the Web Audio API is currently playing AI voice output. */
    isAiSpeaking,
    /** True if the local WASM VAD model is currently initializing. */
    isVADLoading,
    /** True if the user has spoken, but the AI has not yet responded. */
    isThinking,
    /** Critical state gate used to unlock UI controls after the primary greeting. */
    hasFinishedInitialGreeting,
    /** Fatal error message, if present. */
    error,
    startSession,
    endSession: cleanup,
    /** Safely suspends or resumes microphone listening without breaking the web socket. */
    toggleRecording: async () => {
      if (isRecording) {
        await pauseVAD();
      } else {
        await startVAD();
      }
    },
  };
};
