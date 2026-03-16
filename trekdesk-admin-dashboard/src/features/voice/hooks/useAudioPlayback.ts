import { useState, useCallback, useRef, useEffect } from "react";
import { PlaybackEngine } from "../services/PlaybackEngine";

export interface AudioPlaybackOptions {
  onAiSpeakingStart?: () => void;
  onAiSpeakingEnd?: () => void;
}

/**
 * useAudioPlayback
 *
 * Orchestrates the PlaybackEngine within React.
 */
export const useAudioPlayback = (options: AudioPlaybackOptions = {}) => {
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const engineRef = useRef<PlaybackEngine | null>(null);
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Initialize engine on first use
  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new PlaybackEngine();
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
  }, []); // Empty dependencies ensure getEngine is stable

  const playAudio = useCallback(
    (base64Data: string) => {
      getEngine().playBase64(base64Data);
    },
    [getEngine],
  );

  const stopAudio = useCallback(() => {
    getEngine().stopAll();
  }, [getEngine]);

  const resumeAudio = useCallback(async () => {
    await getEngine().resume();
  }, [getEngine]);

  // Cleanup on unmount
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
