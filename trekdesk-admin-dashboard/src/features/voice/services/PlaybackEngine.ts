import { base64ToFloat32, OUTPUT_SAMPLE_RATE } from "../utils/audioUtils";

/**
 * PlaybackEngine
 *
 * A high-performance audio synchronization service built on the Web Audio API.
 * It provides gapless playback of raw PCM audio chunks received as base64 strings.
 *
 * Core Responsibilities:
 * - Manages the `AudioContext` lifecycle and sample rate synchronization.
 * - Orchestrates time-stamped buffering to ensure smooth, jitter-free playback.
 * - Dispatches vocal activity events for UI synchronization (e.g., visualizers).
 * - Handles non-linear interruptions (stopping all active audio sources).
 *
 * @category Services
 * @module PlaybackEngine
 */
export class PlaybackEngine {
  /** The primary control interface for the Web Audio API. */
  private ctx: AudioContext | null = null;

  /**
   * Tracks the absolute time (in seconds) when the next audio chunk should begin.
   * This is critical for gapless scheduling of independent buffer nodes.
   */
  private nextStartTime: number = 0;

  /**
   * Registry of currently playing source nodes.
   * Used for bulk-cleanup and interruption logic.
   */
  private activeSources: Set<AudioBufferSourceNode> = new Set();

  /** Callback triggered when the first audio chunk starts playing in a sequence. */
  onAiSpeakingStart?: () => void;

  /** Callback triggered when the final scheduled audio chunk finishes playing. */
  onAiSpeakingEnd?: () => void;

  /**
   * Initializes the engine and prepares the AudioContext.
   */
  constructor() {
    this.initContext();
  }

  /**
   * Internal helper to bootstrap the AudioContext with the system-standard sample rate.
   * @private
   */
  private initContext() {
    try {
      this.ctx = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE });
      this.nextStartTime = this.ctx.currentTime;
    } catch (e) {
      console.error("Failed to initialize AudioContext:", e);
    }
  }

  /**
   * Resumes the AudioContext if it has been suspended by the browser.
   * Browsers often suspend contexts until a user interaction occurs.
   * @returns {Promise<void>}
   */
  async resume() {
    if (this.ctx?.state === "suspended") {
      await this.ctx.resume();
    }
    if (this.ctx) {
      // Synchronize scheduling clock with the current hardware clock
      this.nextStartTime = Math.max(this.ctx.currentTime, this.nextStartTime);
    }
  }

  /**
   * Schedules a base64-encoded PCM chunk for immediate or queued playback.
   *
   * @param base64Data - Raw PCM data encoded as a base64 string.
   * @description
   * 1. Decodes base64 to Float32Array.
   * 2. Wraps data in an AudioBuffer.
   * 3. Schedules a BufferSourceNode at `nextStartTime`.
   * 4. Updates `nextStartTime` to the end of this new chunk.
   */
  playBase64(base64Data: string) {
    if (!this.ctx) return;

    try {
      // 1. Convert transmission format to audio-ready Float32
      const float32Data = base64ToFloat32(base64Data);

      // 2. Prepare the buffer with the standard output sample rate
      const audioBuffer = this.ctx.createBuffer(
        1, // Mono output
        float32Data.length,
        OUTPUT_SAMPLE_RATE,
      );
      audioBuffer.getChannelData(0).set(float32Data);

      // 3. Create and connect the transient source node
      const source = this.ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.ctx.destination);

      // 4. Determine schedule time (either now or immediately after the previous chunk)
      const startTime = Math.max(this.ctx.currentTime, this.nextStartTime);
      source.start(startTime);

      // 5. Update the playhead for the next chunk's arrival
      this.nextStartTime = startTime + audioBuffer.duration;

      this.activeSources.add(source);

      // Notify UI logic that voice activity has commenced
      if (this.activeSources.size === 1) {
        this.onAiSpeakingStart?.();
      }

      // Cleanup registry when the chunk finishes playing
      source.onended = () => {
        this.activeSources.delete(source);
        // Notify UI logic when the buffer becomes completely empty
        if (this.activeSources.size === 0) {
          this.onAiSpeakingEnd?.();
        }
      };
    } catch (err) {
      console.error("PlaybackEngine execution error:", err);
    }
  }

  /**
   * Forces an immediate stop of all scheduled and active audio.
   * Essential for implementation of user interruptions.
   */
  stopAll() {
    this.activeSources.forEach((source) => {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Handle cases where source was already finalized
      }
    });

    this.activeSources.clear();

    if (this.ctx) {
      // Reset the scheduling clock to current time
      this.nextStartTime = this.ctx.currentTime;
    }

    this.onAiSpeakingEnd?.();
  }

  /**
   * Gracefully shuts down the engine and releases hardware resources.
   */
  destroy() {
    this.stopAll();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }

  /**
   * Reactive getter for the underlying AudioContext state.
   */
  get state() {
    return this.ctx?.state;
  }
}
