import { useState, useCallback, useRef, useEffect } from "react";
import { getMicVAD } from "../utils/vadBridge";

/**
 * Configuration options for the Voice Activity Detection (VAD) hook.
 * @interface VADHookOptions
 */
export interface VADHookOptions {
  /** Callback fired when the VAD enters a positive speech state. */
  onSpeechStart?: () => void;
  /** Callback fired when the VAD confirms the user has stopped speaking. */
  onSpeechEnd?: () => void;
  /** Callback fired if the VAD detects sound but retroactively determines it wasn't speech (e.g., a cough or sudden noise). */
  onMisfire?: () => void;
  /**
   * Callback fired repeatedly while speech is occurring, providing raw audio data.
   * @param probabilities - The confidence score from the ONNX model.
   * @param frame - The raw Float32 PCM audio chunk for the current timeframe.
   */
  onFrameProcessed?: (
    probabilities: Record<string, number>,
    frame: Float32Array,
  ) => void;
  /** Override for the directory containing the ONNX models and WASM binaries. */
  baseAssetPath?: string;
}

/**
 * Internal interface representing the initialized @ricky0123/vad-web instance.
 * @internal
 */
interface MicVAD {
  start: () => Promise<void>;
  pause: () => Promise<void>;
  destroy: () => Promise<void>;
}

/**
 * useVAD
 *
 * Orchestrates the Silero Voice Activity Detection (VAD) model.
 * It handles the asynchronous loading of WASM/ONNX assets, configures the
 * sensitivity of the neural network, and manages the microphone lifecycle.
 *
 * @category Hooks
 * @module useVAD
 */
export const useVAD = (options: VADHookOptions = {}) => {
  // --- 1. STATE MANAGEMENT ---
  /** Indicates that the heavy WASM binaries and AI models are currently downloading/parsing. */
  const [isVADLoading, setIsVADLoading] = useState(false);
  /** Indicates that the microphone is active and feeding data to the VAD. */
  const [isRecording, setIsRecording] = useState(false);

  /** Holds the singleton instance of the underlying VAD library. */
  const vadRef = useRef<MicVAD | null>(null);

  // Stable reference to options to prevent infinite render loops
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // --- 2. VAD INITIALIZATION ---

  /**
   * Lazily loads and initializes the ONNX runtime and Silero model.
   * This is a heavy operation and is deferred until the user explicitly attempts to start a session.
   * @returns The initialized MicVAD instance.
   * @throws Will throw if the browser blocks microphone access or assets fail to load.
   */
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

        // Map library events to hook callbacks
        onSpeechStart: () => optionsRef.current.onSpeechStart?.(),
        onSpeechEnd: () => optionsRef.current.onSpeechEnd?.(),
        onVADMisfire: () => optionsRef.current.onMisfire?.(),
        onFrameProcessed: (
          probs: Record<string, number>,
          frame: Float32Array,
        ) => optionsRef.current.onFrameProcessed?.(probs, frame),

        // --- Robustness Tuning Parameters ---
        // How many consecutive frames must hit the probability threshold before firing 'onSpeechStart'.
        // Higher = fewer false positives, but slightly more latency before recording starts.
        minSpeechFrames: 3,
        // How many consecutive negative frames pass before firing 'onSpeechEnd'.
        // Higher = tolerates longer pauses in speech without cutting the user off.
        redemptionFrames: 8,
        // The confidence threshold (0.0 to 1.0) required for a frame to be considered speech.
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

  // --- 3. LIFECYCLE CONTROLS ---

  /**
   * Unmutes the microphone and begins processing audio frames through the neural network.
   * If the VAD is not yet initialized, it will initialize it first.
   */
  const startVAD = useCallback(async () => {
    if (!vadRef.current) await initVAD();
    if (vadRef.current) {
      await vadRef.current.start();
      setIsRecording(true);
    }
  }, [initVAD]);

  /**
   * Mutes the microphone and halts neural network processing to save battery/CPU.
   * Keeps the initialized model in memory for quick resuming.
   */
  const pauseVAD = useCallback(async () => {
    if (vadRef.current) {
      await vadRef.current.pause();
      setIsRecording(false);
    }
  }, []);

  /**
   * Completely destroys the VAD instance, releasing the microphone and freeing memory.
   */
  const destroyVAD = useCallback(async () => {
    if (vadRef.current) {
      await vadRef.current.destroy();
      vadRef.current = null;
    }
    setIsRecording(false);
  }, []);

  // Ensure hardware resources are released if the component unmounts unexpectedly
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
