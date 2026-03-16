/**
 * AudioStreamService
 *
 * Manages the WebSocket connection and real-time audio streaming.
 * Handles command sending (stop) and audio packet reception.
 */
export class AudioStreamService {
  private socket: WebSocket | null = null;

  onMessage?: (data: Record<string, unknown>) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (err: string) => void;

  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => this.onOpen?.();

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessage?.(data);
        } catch (e) {
          console.error("AudioStreamService message parse error", e);
        }
      };

      this.socket.onclose = () => this.onClose?.();
      this.socket.onerror = () => this.onError?.("WebSocket connection error");
    } catch {
      this.onError?.("Failed to create WebSocket");
    }
  }

  sendAudio(base64Audio: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ audio: base64Audio }));
    }
  }

  sendStop() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ command: "stop" }));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
  }

  get isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}
