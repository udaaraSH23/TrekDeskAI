import { base64ToFloat32, OUTPUT_SAMPLE_RATE } from "../utils/audioUtils";

/**
 * PlaybackEngine
 *
 * Manages the Web Audio API lifecycle, buffering, and scheduled playback.
 * This class is decoupled from React.
 */
export class PlaybackEngine {
  private ctx: AudioContext | null = null;
  private nextStartTime: number = 0;
  private activeSources: Set<AudioBufferSourceNode> = new Set();

  onAiSpeakingStart?: () => void;
  onAiSpeakingEnd?: () => void;

  constructor() {
    this.initContext();
  }

  private initContext() {
    try {
      this.ctx = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE });
      this.nextStartTime = this.ctx.currentTime;
    } catch (e) {
      console.error("Failed to initialize AudioContext", e);
    }
  }

  async resume() {
    if (this.ctx?.state === "suspended") {
      await this.ctx.resume();
    }
    if (this.ctx) {
      this.nextStartTime = Math.max(this.ctx.currentTime, this.nextStartTime);
    }
  }

  playBase64(base64Data: string) {
    if (!this.ctx) return;

    try {
      const float32Data = base64ToFloat32(base64Data);
      const audioBuffer = this.ctx.createBuffer(
        1,
        float32Data.length,
        OUTPUT_SAMPLE_RATE,
      );
      audioBuffer.getChannelData(0).set(float32Data);

      const source = this.ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.ctx.destination);

      const startTime = Math.max(this.ctx.currentTime, this.nextStartTime);
      source.start(startTime);
      this.nextStartTime = startTime + audioBuffer.duration;

      this.activeSources.add(source);

      if (this.activeSources.size === 1) {
        this.onAiSpeakingStart?.();
      }

      source.onended = () => {
        this.activeSources.delete(source);
        if (this.activeSources.size === 0) {
          this.onAiSpeakingEnd?.();
        }
      };
    } catch (err) {
      console.error("PlaybackEngine error:", err);
    }
  }

  stopAll() {
    this.activeSources.forEach((source) => {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Already stopped
      }
    });
    this.activeSources.clear();
    if (this.ctx) {
      this.nextStartTime = this.ctx.currentTime;
    }
    this.onAiSpeakingEnd?.();
  }

  destroy() {
    this.stopAll();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }

  get state() {
    return this.ctx?.state;
  }
}
