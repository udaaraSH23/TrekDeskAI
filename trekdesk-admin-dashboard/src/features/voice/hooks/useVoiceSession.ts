import { useState, useEffect, useRef, useCallback } from "react";

/**
 * VoiceSessionOptions
 * Callbacks for handling various session events.
 */
export interface VoiceSessionOptions {
  onAiSpeakingStart?: () => void;
  onAiSpeakingEnd?: () => void;
  onStatusChange?: (status: string) => void;
  onGreetingReceived?: () => void;
  onMessageReceived?: (data: Record<string, unknown>) => void;
  onError?: (error: string) => void;
}

const SAMPLE_RATE = 24000;

/**
 * useVoiceSession
 * Encapsulates the core logic for real-time multimodal voice sessions.
 * Manages WebSocket, AudioContext, and microphone stream.
 */
export const useVoiceSession = (options: VoiceSessionOptions = {}) => {
  // Use a ref to store the latest options to avoid re-triggering effects/callbacks
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (socketRef.current) {
      // Small delay to allow any pending messages to be sent/buffered
      const socket = socketRef.current;
      socketRef.current = null;
      socket.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    setIsActive(false);
    setIsRecording(false);
    setIsConnecting(false);
    setIsAiSpeaking(false);
    optionsRef.current.onAiSpeakingEnd?.();
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const initAudioContext = useCallback(async () => {
    if (
      !audioContextRef.current ||
      audioContextRef.current.state === "closed"
    ) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error("Web Audio API not supported");
      }
      audioContextRef.current = new AudioContextClass({
        sampleRate: SAMPLE_RATE,
      });
    }
    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const playBinaryAudio = useCallback((base64Data: string) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    try {
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const int16Data = new Int16Array(bytes.buffer);
      const float32Data = new Float32Array(int16Data.length);
      for (let i = 0; i < int16Data.length; i++) {
        float32Data[i] = int16Data[i] / 32768.0;
      }

      const audioBuffer = ctx.createBuffer(1, float32Data.length, SAMPLE_RATE);
      audioBuffer.getChannelData(0).set(float32Data);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
      source.start(startTime);
      nextStartTimeRef.current = startTime + audioBuffer.duration;

      // Use functional state update to check current isAiSpeaking
      setIsAiSpeaking((prev) => {
        if (!prev) {
          optionsRef.current.onAiSpeakingStart?.();
          return true;
        }
        return prev;
      });

      source.onended = () => {
        if (ctx.currentTime >= nextStartTimeRef.current - 0.1) {
          setIsAiSpeaking(false);
          optionsRef.current.onAiSpeakingEnd?.();
        }
      };
    } catch (err) {
      console.error("Audio playback error", err);
    }
  }, []);

  const startSession = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    optionsRef.current.onStatusChange?.("Connecting...");

    try {
      const audioCtx = await initAudioContext();
      nextStartTimeRef.current = audioCtx.currentTime;

      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const wsUrl = baseUrl.replace("http", "ws").replace("/api/v1", "");

      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnecting(false);
        setIsActive(true);
        optionsRef.current.onStatusChange?.("Connected");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          optionsRef.current.onMessageReceived?.(data);

          if (data.parts) {
            for (const part of data.parts) {
              if (part.inlineData?.mimeType?.includes("audio")) {
                optionsRef.current.onGreetingReceived?.();
                playBinaryAudio(part.inlineData.data);
              }
            }
          }
        } catch (e) {
          console.error("Socket message error", e);
        }
      };

      socket.onerror = () => {
        const msg = "WebSocket connection error";
        setError(msg);
        optionsRef.current.onError?.(msg);
        cleanup();
      };

      socket.onclose = () => {
        cleanup();
      };
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to start session";
      setError(msg);
      optionsRef.current.onError?.(msg);
      setIsConnecting(false);
      cleanup();
    }
  }, [cleanup, initAudioContext, playBinaryAudio]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = await initAudioContext();

      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);

        let l = inputData.length;
        const buf = new Int16Array(l);
        while (l--) {
          const s = Math.max(-1, Math.min(1, inputData[l]));
          buf[l] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        const bytes = new Uint8Array(buf.buffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Audio = btoa(binary);

        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ audio: base64Audio }));
        }
      };

      source.connect(processor);
      processor.connect(ctx.destination);
      setIsRecording(true);
      optionsRef.current.onStatusChange?.("Listening");
    } catch (err) {
      console.error(err);
      const msg = "Microphone access denied";
      setError(msg);
      optionsRef.current.onError?.(msg);
    }
  }, [initAudioContext]);

  const stopRecording = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    setIsRecording(false);
    optionsRef.current.onStatusChange?.("Active");
  }, []);

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, stopRecording, startRecording]);

  return {
    isActive,
    isConnecting,
    isRecording,
    isAiSpeaking,
    error,
    setError,
    startSession,
    endSession: cleanup,
    toggleRecording,
    stopRecording,
  };
};
