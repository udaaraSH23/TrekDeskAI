import { useState, useCallback, useRef, useEffect } from "react";
import { PlaybackEngine } from "../services/PlaybackEngine";

/**
 * Configuration options for the Audio Playback hook.
 * @interface AudioPlaybackOptions
 */
export interface AudioPlaybackOptions {
  /** Callback fired when the PlaybackEngine starts playing the first audio chunk in a sequence. */
  onAiSpeakingStart?: () => void;
  /** Callback fired when the PlaybackEngine concludes playing the last audio chunk in its buffer. */
  onAiSpeakingEnd?: () => void;
}

/**
 * useAudioPlayback
 *
 * A custom React hook that bridges the imperative, non-React `PlaybackEngine`
 * with React's reactive state paradigm. It ensures that only a single instance
 * of the Web Audio API engine is active at a given time and syncs its
 * playing status with UI components.
 *
 * @category Hooks
 * @module useAudioPlayback
 */
export const useAudioPlayback = (options: AudioPlaybackOptions = {}) => {
  // --- 1. REACTIVE STATE ---
  /**
   * Boolean indicating if audio is actively coming out of the user's speakers.
   * Used to trigger UI animations (like the VoiceVisualizer waves).
   */
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // --- 2. INTERNAL REFS ---
  /** Holds the singleton instance of the vanilla TS PlaybackEngine. */
  const engineRef = useRef<PlaybackEngine | null>(null);

  // Stable reference to options array to prevent infinite re-renders on callbacks
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // --- 3. ENGINE INITIALIZATION & PROXYING ---

  /**
   * Implements a lazy-loading Singleton pattern for the PlaybackEngine.
   * We only initialize the Web Audio context when it's strictly needed to avoid
   * browser auto-play policies blocking it prematurely.
   *
   * @returns The active PlaybackEngine instance.
   * @internal
   */
  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new PlaybackEngine();

      // Proxy engine events into React state and optional prop callbacks
      engineRef.current.onAiSpeakingStart = () => {
        setIsAiSpeaking(true);
        optionsRef.current.onAiSpeakingStart?.();
      };

      engineRef.current.onAiSpeakingEnd = () => {
        setIsAiSpeaking(false);
        optionsRef.current.onAiSpeakingEnd?.();
      };
    }
    return engineRef.current;
  }, []); // Empty dependencies array ensures the getter reference is stable throughout the component lifecycle

  // --- 4. PUBLIC API ---

  /**
   * Queues a base64-encoded PCM audio chunk for gapless playback.
   * @param base64Data - Raw audio data provided by the Multimodal API.
   */
  const playAudio = useCallback(
    (base64Data: string) => {
      getEngine().playBase64(base64Data);
    },
    [getEngine],
  );

  /**
   * Immediately halts all current and queued audio playback.
   * This is heavily used during barge-in/interruption scenarios.
   */
  const stopAudio = useCallback(() => {
    getEngine().stopAll();
  }, [getEngine]);

  /**
   * Bootstraps the AudioContext from a suspended state.
   * MUST be called synchronously within a user-interaction handler (e.g., onClick)
   * to comply with strict modern browser autoplay policies.
   */
  const resumeAudio = useCallback(async () => {
    await getEngine().resume();
  }, [getEngine]);

  // --- 5. LIFECYCLE MANAGEMENT ---

  // Disconnect hardware and clear memory if the parent component unmounts
  useEffect(() => {
    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  return {
    isAiSpeaking,
    playAudio,
    stopAudio,
    resumeAudio,
  };
};
