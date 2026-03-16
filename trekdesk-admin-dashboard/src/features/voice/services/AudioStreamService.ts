/**
 * AudioStreamService
 *
 * Orchestrates the bidirectional WebSocket communication for low-latency AI voice interaction.
 * It serves as the primary transport layer between the client's audio capture (VAD)
 * and the backend's multimodal processing engine (Gemini).
 *
 * Core Responsibilities:
 * - Manages WebSocket connection lifecycle (Connect, Heartbeat, Reconnect logic handled upstream).
 * - Sanitizes and parses incoming server messages (audio chunks and control signals).
 * - Dispatches outgoing audio packets in a standardized JSON format.
 * - Handles non-linear control commands like "stop" for instant AI interruption.
 *
 * @category Services
 * @module AudioStreamService
 */
export class AudioStreamService {
  /** The underlying WebSocket instance. */
  private socket: WebSocket | null = null;

  /** Callback triggered when a valid server message is parsed. */
  onMessage?: (data: Record<string, unknown>) => void;

  /** Callback triggered when the secure tunnel is successfully established. */
  onOpen?: () => void;

  /** Callback triggered when the connection is intentionally or unexpectedly severed. */
  onClose?: () => void;

  /** Callback triggered when a protocol or network-level error occurs. */
  onError?: (err: string) => void;

  /** The absolute WebSocket URL (typically wss://). */
  private url: string;

  /**
   * Prepares the service with a target endpoint.
   * @param url - The WebSocket gateway URL.
   */
  constructor(url: string) {
    this.url = url;
  }

  /**
   * Initiates the WebSocket handshake and registers protocol event listeners.
   * @throws {Error} If the URL is malformed or the browser blocks the connection.
   */
  connect() {
    try {
      this.socket = new WebSocket(this.url);

      // Handle handshake success
      this.socket.onopen = () => this.onOpen?.();

      // Handle incoming data packets
      this.socket.onmessage = (event) => {
        try {
          // All Gemini/Backend communication expects valid JSON payloads
          const data = JSON.parse(event.data);
          this.onMessage?.(data);
        } catch (e) {
          console.error("AudioStreamService protocol parsing error:", e);
        }
      };

      // Handle connection closure
      this.socket.onclose = () => this.onClose?.();

      // Handle connection failures
      this.socket.onerror = () =>
        this.onError?.("WebSocket connection to gateway failed.");
    } catch (err) {
      console.error("AudioStreamService initialization failed:", err);
      this.onError?.("Failed to initialize secure WebSocket tunnel.");
    }
  }

  /**
   * Transmits a raw audio frame to the AI server.
   * @param base64Audio - PCM audio chunk converted to a base64 string for transmission.
   * @description Data is wrapped in a standard JSON wrapper expected by the backend orchestrator.
   */
  sendAudio(base64Audio: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ audio: base64Audio }));
    }
  }

  /**
   * Dispatches a control command to force the AI to cease current vocalization.
   * critical for maintaining the "naturality" of the turn-taking model.
   */
  sendStop() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ command: "stop" }));
    }
  }

  /**
   * Gracefully tears down the connection and removes internal listeners.
   */
  disconnect() {
    if (this.socket) {
      // Remove listeners to prevent memory leaks during rapid connect/disconnect cycles
      this.socket.onclose = null;
      this.socket.onerror = null;
      this.socket.onopen = null;
      this.socket.onmessage = null;

      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Reactive getter for the connection state.
   */
  get isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}
