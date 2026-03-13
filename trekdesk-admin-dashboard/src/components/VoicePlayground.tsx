import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Loader2,
  MessageSquare,
  Headphones,
} from "lucide-react";
import { Button } from "./ui/Button";
import { usePersonaSettings } from "../hooks/usePersona";

interface VoicePlaygroundProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * VoicePlayground
 * A premium live sandbox to test the AI persona's voice and behavior.
 * Features automated audio context management and visual feedback.
 */
export const VoicePlayground: React.FC<VoicePlaygroundProps> = ({
  isOpen,
  onClose,
}) => {
  const { data: settings } = usePersonaSettings();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<
    { type: "user" | "ai"; text: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const cleanup = React.useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    // We keep the AudioContext alive but suspended to avoid re-initialization issues
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.suspend();
    }
    setIsActive(false);
    setIsRecording(false);
    setIsConnecting(false);
    setIsAiSpeaking(false);
    setHasGreeted(false);
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const initAudioContext = async () => {
    if (
      !audioContextRef.current ||
      audioContextRef.current.state === "closed"
    ) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const startSession = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      // 1. Initialize Audio Context on User Gesture
      const audioCtx = await initAudioContext();
      nextStartTimeRef.current = audioCtx.currentTime;

      // 2. Connect to WebSocket
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const wsUrl = baseUrl.replace("http", "ws").replace("/api/v1", "");

      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnecting(false);
        setIsActive(true);
        setHasGreeted(false); // Reset for new session
        setTranscript([
          { type: "ai", text: "Connecting to Trek Assistant..." },
        ]);
      };

      socket.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.parts) {
            for (const part of data.parts) {
              if (
                part.inlineData &&
                part.inlineData.mimeType.includes("audio")
              ) {
                playBinaryAudio(part.inlineData.data);
              }
            }
          }
        } catch (e) {
          console.error("Failed to parse socket message", e);
        }
      };

      socket.onerror = () => {
        setError("Connection error. Ensure the backend is running.");
        cleanup();
      };

      socket.onclose = () => {
        setIsActive(false);
      };
    } catch (err) {
      console.error(err);
      setError("Failed to start voice session.");
      setIsConnecting(false);
    }
  };

  const playBinaryAudio = (base64Data: string) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    try {
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // PCM 16-bit
      const int16Data = new Int16Array(bytes.buffer);
      const float32Data = new Float32Array(int16Data.length);
      for (let i = 0; i < int16Data.length; i++) {
        float32Data[i] = int16Data[i] / 32768.0;
      }

      const audioBuffer = ctx.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      // Queuing logic to avoid gaps
      const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
      source.start(startTime);
      nextStartTimeRef.current = startTime + audioBuffer.duration;

      // Visual feedback
      setIsAiSpeaking(true);
      source.onended = () => {
        if (ctx.currentTime >= nextStartTimeRef.current - 0.1) {
          setIsAiSpeaking(false);
          setHasGreeted(true); // AI has finished at least one turn
        }
      };
    } catch (err) {
      console.error("Audio playback error", err);
    }
  };

  const toggleMic = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // We use the same context or a child node to handle recording
      const ctx = await initAudioContext();

      const source = ctx.createMediaStreamSource(stream);
      // Reduced buffer size to 2048 (from 4096) for lower latency (~85ms @ 24kHz)
      const processor = ctx.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const int16Data = convertFloat32ToInt16(inputData);

        // Use a more efficient way to convert to base64 for real-time audio
        let binary = "";
        const bytes = new Uint8Array(int16Data.buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
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
    } catch (err) {
      console.error(err);
      setError("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    setIsRecording(false);
  };

  const convertFloat32ToInt16 = (buffer: Float32Array) => {
    let l = buffer.length;
    const buf = new Int16Array(l);
    while (l--) {
      // Clamping and scaling
      const s = Math.max(-1, Math.min(1, buffer[l]));
      buf[l] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return buf;
  };

  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        {/* Header */}
        <header style={modalHeaderStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={iconBadgeStyle}>
              <Sparkles size={18} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
                Voice Studio
              </h2>
              <div style={statusDotContainer}>
                <div
                  style={{
                    ...statusDot,
                    backgroundColor: isActive ? "#10b981" : "#6b7280",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--muted-foreground)",
                  }}
                >
                  {isActive ? "Connected" : "Offline"}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={closeButtonStyle}>
            <X size={20} />
          </button>
        </header>

        {/* Body */}
        <div style={playgroundBodyStyle}>
          {/* Settings Bar */}
          <div style={settingsBarStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Headphones size={14} color="var(--primary)" />
              <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                {settings?.voice_name || "Aoede"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MessageSquare size={14} color="var(--primary)" />
              <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                Temp: {settings?.temperature}
              </span>
            </div>
          </div>

          {/* Transcript Area */}
          <div style={transcriptContainerStyle}>
            {transcript.length === 0 && !isConnecting && (
              <div style={emptyStateStyle}>
                <Volume2 size={48} color="rgba(255,255,255,0.05)" />
                <p>Start a session to begin testing your AI persona's voice.</p>
              </div>
            )}

            {transcript.map((msg, i) => (
              <div
                key={i}
                style={msg.type === "user" ? userMsgStyle : aiMsgStyle}
              >
                <div
                  style={{
                    ...msgTextStyle,
                    backgroundColor:
                      msg.type === "user"
                        ? "var(--primary)"
                        : "rgba(255,255,255,0.05)",
                    color: msg.type === "user" ? "white" : "inherit",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isConnecting && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "1rem",
                }}
              >
                <Loader2
                  className="animate-spin"
                  size={18}
                  color="var(--primary)"
                />
                <span
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--muted-foreground)",
                  }}
                >
                  Establishing secure link...
                </span>
              </div>
            )}

            {error && <div style={errorBannerStyle}>{error}</div>}
            <div ref={transcriptEndRef} />
          </div>

          {/* Controls - Fixed to bottom */}
          <footer style={controlsAreaStyle}>
            {!isActive ? (
              <Button
                onClick={startSession}
                isLoading={isConnecting}
                style={startButtonStyle}
              >
                Launch Live Session
              </Button>
            ) : (
              <div style={activeControlsGroup}>
                <div style={visualizerContainer}>
                  {/* Animated Speaking Waves */}
                  {isAiSpeaking && (
                    <div style={waveContainer}>
                      <div
                        className="bar"
                        style={{ ...barStyle, animationDelay: "0s" }}
                      />
                      <div
                        className="bar"
                        style={{ ...barStyle, animationDelay: "0.1s" }}
                      />
                      <div
                        className="bar"
                        style={{
                          ...barStyle,
                          animationDelay: "0.2s",
                          height: "100%",
                        }}
                      />
                      <div
                        className="bar"
                        style={{ ...barStyle, animationDelay: "0.3s" }}
                      />
                      <div
                        className="bar"
                        style={{ ...barStyle, animationDelay: "0.4s" }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ position: "relative" }}>
                  <button
                    onClick={toggleMic}
                    disabled={!hasGreeted && !isRecording}
                    style={{
                      ...micButtonStyle,
                      backgroundColor: isRecording
                        ? "#ef4444"
                        : "var(--primary)",
                      transform: isRecording ? "scale(1.1)" : "scale(1)",
                      opacity: !hasGreeted && !isRecording ? 0.5 : 1,
                      cursor:
                        !hasGreeted && !isRecording ? "not-allowed" : "pointer",
                    }}
                  >
                    {isRecording ? (
                      <MicOff size={32} color="white" />
                    ) : (
                      <Mic size={32} color="white" />
                    )}
                    {isRecording && <div style={pulseRing} />}
                  </button>
                </div>

                <p
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: isRecording ? "#ef4444" : "white",
                  }}
                >
                  {!hasGreeted
                    ? "Waiting for greeting..."
                    : isRecording
                      ? "I'm Listening..."
                      : "Tap to Speak"}
                </p>

                <button onClick={cleanup} style={endSessionButtonStyle}>
                  End Session
                </button>
              </div>
            )}
          </footer>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes wave {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
        .bar {
          animation: wave 1s ease-in-out infinite;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Styles
const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.9)",
  backdropFilter: "blur(12px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  width: "650px",
  height: "85vh",
  maxHeight: "800px",
  backgroundColor: "#09090b",
  borderRadius: "32px",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxShadow: "0 40px 100px -20px rgba(0,0,0,1)",
};

const modalHeaderStyle: React.CSSProperties = {
  padding: "1.5rem 2rem",
  borderBottom: "1px solid rgba(255,255,255,0.05)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "linear-gradient(to bottom, rgba(255,255,255,0.02), transparent)",
};

const iconBadgeStyle: React.CSSProperties = {
  width: "40px",
  height: "40px",
  borderRadius: "12px",
  background: "linear-gradient(135deg, var(--primary), #3b82f6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)",
};

const statusDotContainer: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  marginTop: "2px",
};

const statusDot: React.CSSProperties = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
};

const closeButtonStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "none",
  color: "#9ca3af",
  cursor: "pointer",
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s",
};

const playgroundBodyStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden", // Crucial: contains the children
};

const settingsBarStyle: React.CSSProperties = {
  display: "flex",
  gap: "20px",
  padding: "1rem 2rem",
  backgroundColor: "rgba(255,255,255,0.02)",
  borderBottom: "1px solid rgba(255,255,255,0.03)",
};

const transcriptContainerStyle: React.CSSProperties = {
  flex: 1,
  padding: "2rem",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
};

const aiMsgStyle: React.CSSProperties = {
  display: "flex",
  alignSelf: "flex-start",
  maxWidth: "80%",
};

const userMsgStyle: React.CSSProperties = {
  display: "flex",
  alignSelf: "flex-end",
  maxWidth: "80%",
};

const msgTextStyle: React.CSSProperties = {
  padding: "1rem 1.25rem",
  borderRadius: "20px",
  fontSize: "0.95rem",
  lineHeight: "1.5",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const emptyStateStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--muted-foreground)",
  textAlign: "center",
  gap: "1rem",
};

const controlsAreaStyle: React.CSSProperties = {
  padding: "2rem",
  background: "linear-gradient(to top, #09090b, transparent)",
  display: "flex",
  justifyContent: "center",
  minHeight: "180px", // Fixed minimum height ensures buttons stay visible
};

const startButtonStyle: React.CSSProperties = {
  width: "280px",
  height: "56px",
  fontSize: "1rem",
  fontWeight: 600,
  borderRadius: "16px",
  background: "linear-gradient(135deg, var(--primary), #10b981)",
  boxShadow: "0 10px 30px rgba(16, 185, 129, 0.4)",
};

const activeControlsGroup: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.25rem",
  width: "100%",
};

const micButtonStyle: React.CSSProperties = {
  width: "88px",
  height: "88px",
  borderRadius: "50%",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  zIndex: 2,
};

const pulseRing: React.CSSProperties = {
  position: "absolute",
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  border: "4px solid #ef4444",
  animation: "pulse 2s infinite",
  zIndex: 1,
};

const waveContainer: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  height: "30px",
};

const barStyle: React.CSSProperties = {
  width: "3px",
  height: "60%",
  backgroundColor: "var(--primary)",
  borderRadius: "2px",
};

const visualizerContainer: React.CSSProperties = {
  height: "30px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const endSessionButtonStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "white",
  padding: "8px 24px",
  borderRadius: "12px",
  fontSize: "0.85rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
};

const errorBannerStyle: React.CSSProperties = {
  backgroundColor: "rgba(239, 68, 68, 0.1)",
  color: "#ef4444",
  padding: "1rem",
  borderRadius: "12px",
  fontSize: "0.85rem",
  textAlign: "center",
  border: "1px solid rgba(239, 68, 68, 0.2)",
};

export default VoicePlayground;
