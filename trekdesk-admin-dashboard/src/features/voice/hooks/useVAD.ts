import { useState, useCallback, useRef, useEffect } from "react";
import { getMicVAD } from "../utils/vadBridge";

export interface VADHookOptions {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onMisfire?: () => void;
  onFrameProcessed?: (
    probabilities: Record<string, number>,
    frame: Float32Array,
  ) => void;
  baseAssetPath?: string;
}

interface MicVAD {
  start: () => Promise<void>;
  pause: () => Promise<void>;
  destroy: () => Promise<void>;
}

/**
 * useVAD
 *
 * Orchestrates the Silero VAD lifecycle.
 */
export const useVAD = (options: VADHookOptions = {}) => {
  const [isVADLoading, setIsVADLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const vadRef = useRef<MicVAD | null>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const initVAD = useCallback(async () => {
    setIsVADLoading(true);
    try {
      const MicVAD = await getMicVAD();
      vadRef.current = await MicVAD.new({
        baseAssetPath: optionsRef.current.baseAssetPath || "/vad/",
        onnxWASMBasePath: optionsRef.current.baseAssetPath || "/vad/",
        modelURL:
          (optionsRef.current.baseAssetPath || "/vad/") + "silero_vad_v5.onnx",
        model:
          (optionsRef.current.baseAssetPath || "/vad/") + "silero_vad_v5.onnx",
        onSpeechStart: () => optionsRef.current.onSpeechStart?.(),
        onSpeechEnd: () => optionsRef.current.onSpeechEnd?.(),
        onVADMisfire: () => optionsRef.current.onMisfire?.(),
        onFrameProcessed: (
          probs: Record<string, number>,
          frame: Float32Array,
        ) => optionsRef.current.onFrameProcessed?.(probs, frame),
        // Robustness Tuning
        minSpeechFrames: 3,
        redemptionFrames: 8,
        positiveSpeechThreshold: 0.45,
      });
      setIsVADLoading(false);
      return vadRef.current;
    } catch (e) {
      setIsVADLoading(false);
      console.error("VAD Initialization failed", e);
      throw e;
    }
  }, []); // Stable dependencies

  const startVAD = useCallback(async () => {
    if (!vadRef.current) await initVAD();
    if (vadRef.current) {
      await vadRef.current.start();
      setIsRecording(true);
    }
  }, [initVAD]);

  const pauseVAD = useCallback(async () => {
    if (vadRef.current) {
      await vadRef.current.pause();
      setIsRecording(false);
    }
  }, []);

  const destroyVAD = useCallback(async () => {
    if (vadRef.current) {
      await vadRef.current.destroy();
      vadRef.current = null;
    }
    setIsRecording(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vadRef.current) {
        vadRef.current.destroy();
      }
    };
  }, []);

  return {
    isVADLoading,
    isRecording,
    startVAD,
    pauseVAD,
    destroyVAD,
  };
};
