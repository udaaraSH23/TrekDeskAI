import { useState, useCallback, useRef, useEffect } from "react";
import { useVAD } from "./useVAD";
import { useAudioPlayback } from "./useAudioPlayback";
import { AudioStreamService } from "../services/AudioStreamService";
import { float32ToBase64 } from "../utils/audioUtils";

export interface VoiceSessionOptions {
  onAiSpeakingStart?: () => void;
  onAiSpeakingEnd?: () => void;
  onStatusChange?: (status: string) => void;
  onGreetingReceived?: () => void;
  onMessageReceived?: (data: Record<string, unknown>) => void;
  onError?: (error: string) => void;
  apiUrl?: string;
}

export type SessionStatus = "idle" | "connecting" | "active" | "error";

/**
 * useVoiceSession
 *
 * The Top-Level Orchestrator.
 * Coordinates VAD, Audio Playback, and Streaming Services.
 */
export const useVoiceSession = (options: VoiceSessionOptions = {}) => {
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const streamServiceRef = useRef<AudioStreamService | null>(null);
  const aiStartedAtRef = useRef<number>(0);

  // 1. Setup Audio Playback Layer
  const { isAiSpeaking, playAudio, stopAudio, resumeAudio } = useAudioPlayback({
    onAiSpeakingStart: () => {
      aiStartedAtRef.current = Date.now();
      setIsThinking(false);
      optionsRef.current.onAiSpeakingStart?.();
    },
    onAiSpeakingEnd: () => optionsRef.current.onAiSpeakingEnd?.(),
  });

  // 2. Setup VAD Layer
  const { isVADLoading, isRecording, startVAD, pauseVAD, destroyVAD } = useVAD({
    onSpeechStart: () => {
      // Interruption Logic
      if (aiStartedAtRef.current > 0) {
        const timeSinceAiStarted = Date.now() - aiStartedAtRef.current;
        if (timeSinceAiStarted > 400) {
          stopAudio();
          streamServiceRef.current?.sendStop();
          aiStartedAtRef.current = 0;
        }
      }
    },
    onSpeechEnd: () => {
      setIsThinking(true);
    },
    onMisfire: () => {
      setIsThinking(false);
    },
    onFrameProcessed: (_probs, frame) => {
      if (streamServiceRef.current?.isConnected) {
        const base64Audio = float32ToBase64(frame);
        streamServiceRef.current.sendAudio(base64Audio);
      }
    },
  });

  const cleanup = useCallback(async () => {
    stopAudio();
    streamServiceRef.current?.disconnect();
    await destroyVAD();
    setStatus("idle");
    setIsThinking(false);
    setError(null);
  }, [destroyVAD, stopAudio]);

  const startSession = useCallback(async () => {
    setStatus("connecting");
    setError(null);
    optionsRef.current.onStatusChange?.("Connecting...");

    try {
      if (!window.isSecureContext) {
        throw new Error(
          "Microphone requires a secure context (HTTPS or localhost).",
        );
      }
      // 1. Initialize Audio contexts in user-gesture
      await resumeAudio();

      // 2. Start VAD (Microphone) in user-gesture
      // Waiting for WS open causes browsers to block mic access because it's no longer in the click stack.
      await startVAD();

      const baseUrl =
        optionsRef.current.apiUrl ||
        import.meta.env.VITE_API_URL ||
        "http://localhost:3001";
      const wsUrl = baseUrl.replace("http", "ws").replace("/api/v1", "");

      const stream = new AudioStreamService(wsUrl);
      streamServiceRef.current = stream;

      stream.onOpen = () => {
        setStatus("active");
        optionsRef.current.onStatusChange?.("Connected");
      };

      stream.onMessage = (data) => {
        optionsRef.current.onMessageReceived?.(data);
        const parts = data.parts;
        if (Array.isArray(parts)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          parts.forEach((part: any) => {
            // we use any here because part is a complex nested object from Gemini
            if (part.inlineData?.mimeType?.includes("audio")) {
              optionsRef.current.onGreetingReceived?.();
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
    status,
    isActive: status === "active",
    isConnecting: status === "connecting",
    isRecording,
    isAiSpeaking,
    isVADLoading,
    isThinking,
    error,
    startSession,
    endSession: cleanup,
    toggleRecording: async () => {
      if (isRecording) {
        await pauseVAD();
      } else {
        await startVAD();
      }
    },
  };
};
