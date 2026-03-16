/**
 * @file vadBridge.ts
 * @description Bridges the Silero VAD UMD bundle (loaded via index.html) into the ESM world.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let vadPromise: Promise<any> | null = null;

/**
 * Returns the MicVAD class from the global 'vad' object.
 * Waits for it to be available if necessary.
 */
export const getMicVAD = async () => {
  if (vadPromise) return vadPromise;

  vadPromise = (async () => {
    // Check if available immediately
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let vad = (window as any).vad;

    if (!vad) {
      // Wait up to 5 seconds for the script tag to load
      for (let i = 0; i < 50; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vad = (window as any).vad;
        if (vad) break;
      }
    }

    if (!vad?.MicVAD) {
      throw new Error(
        "VAD library (bundle.min.js) failed to load globally. Check index.html script tag.",
      );
    }

    return vad.MicVAD;
  })();

  return vadPromise;
};
