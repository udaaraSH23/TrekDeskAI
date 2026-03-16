/**
 * @file audioUtils.ts
 * @description Utility functions for audio processing, format conversion, and encoding.
 */

/** The AI model typically generates higher-fidelity audio at 24kHz. */
export const OUTPUT_SAMPLE_RATE = 24000;
/** Silero VAD and Gemini's base audio intake typically operate at 16kHz. */
export const INPUT_SAMPLE_RATE = 16000;

/**
 * Converts a base64 encoded PCM16 string into a Float32Array suitable for Web Audio API.
 *
 * @param base64Data - Raw PCM16 audio data encoded as base64.
 * @returns Combined Float32Array of the decoded audio data.
 */
export const base64ToFloat32 = (base64Data: string): Float32Array => {
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

  return float32Data;
};

/**
 * Converts a Float32Array into a base64 encoded PCM16 string.
 * This is the format typically expected by real-time AI models like Gemini.
 *
 * @param float32Data - Raw audio data.
 * @returns Base64 encoded PCM16 string.
 */
export const float32ToBase64 = (float32Data: Float32Array): string => {
  const buf = new Int16Array(float32Data.length);

  for (let i = 0; i < float32Data.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Data[i]));
    buf[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  const uint8Data = new Uint8Array(buf.buffer);
  let binary = "";
  const len = uint8Data.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Data[i]);
  }

  return btoa(binary);
};
