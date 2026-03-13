/**
 * @file GeminiService.ts
 * @description integration with Google's Gemini Multimodal Live API via WebSockets.
 * Handles real-time audio streaming, system instruction setup, and tool call responses.
 */

import WebSocket from "ws";
import dotenv from "dotenv";
import { AISettings } from "../types/ai";
import { IGeminiService } from "../interfaces/services/IGeminiService";
import { logger } from "../utils/logger";
import { GeminiResponse, ToolDeclaration } from "../types/gemini";

dotenv.config();

/**
 * API Key retrieved from environment variables for authenticating with Google AI services.
 */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Service class for managing bidirectional communication with the Gemini API.
 * Uses WebSockets to provide low-latency multimodal interactions.
 */
export class GeminiService implements IGeminiService {
  /** The WebSocket URL for Gemini's Generative Service BidiGenerateContent endpoint */
  private wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;

  /**
   * Creates an instance of GeminiService.
   * @param tools - Array of tool definitions (function declarations) the model can invoke.
   */
  constructor(private tools: ToolDeclaration[]) {}

  /**
   * Establishes a WebSocket connection to Gemini and initializes the session with setup parameters.
   *
   * @param onMessage - Callback function triggered when a response is received from the model.
   * @param onClose - Callback function triggered when the connection is closed.
   * @param settings - Configuration settings including system instructions and voice selection.
   * @returns A Promise resolving to the established WebSocket instance once setup is complete.
   */
  public async connectToGemini(
    onMessage: (response: GeminiResponse) => void,
    onClose: () => void,
    settings: AISettings,
  ): Promise<WebSocket> {
    const geminiWs = new WebSocket(this.wsUrl);

    return new Promise((resolve, reject) => {
      /**
       * Safety timeout to prevent successful TCP connections from hanging
       * if the API setup never acknowledges.
       */
      const timeout = setTimeout(() => {
        logger.error(
          "[GeminiService] Handshake timeout: No setupComplete received.",
        );
        geminiWs.close();
        reject(new Error("Gemini handshake timeout"));
      }, 10000);

      geminiWs.on("open", () => {
        /**
         * Initial setup message sent upon connection.
         * Configures the model, system instructions, tools, and output modalities (AUDIO).
         */
        const setupMessage = {
          setup: {
            model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
            systemInstruction: {
              parts: [{ text: settings.systemInstruction }],
            },
            tools: this.tools,
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: settings.voiceName || "Aoede",
                  },
                },
              },
            },
          },
        };

        geminiWs.send(JSON.stringify(setupMessage));
      });

      geminiWs.on("message", (data) => {
        try {
          const raw = data.toString();
          const response = JSON.parse(raw);

          /**
           * Wait for 'setupComplete: true' before resolving the connection.
           * This ensures the session is ready to receive media or client content.
           */
          if (response.setupComplete) {
            logger.info("[GeminiService] Session authenticated and ready.");
            clearTimeout(timeout);
            resolve(geminiWs);
          }

          onMessage(response as GeminiResponse);
        } catch (err) {
          logger.error("[GeminiService] Failed to parse API message:", err);
        }
      });

      geminiWs.on("close", (code) => {
        logger.info(`[GeminiService] Connection closed with code: ${code}`);
        clearTimeout(timeout);
        onClose();
      });

      geminiWs.on("error", (err) => {
        logger.error("[GeminiService] Connection Error:", err);
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  /**
   * Sends real-time audio data to the model.
   *
   * @param geminiWs - The active WebSocket connection.
   * @param base64Audio - PCM audio data encoded as a base64 string.
   */
  public sendAudio(geminiWs: WebSocket, base64Audio: string) {
    if (geminiWs.readyState === WebSocket.OPEN) {
      geminiWs.send(
        JSON.stringify({
          realtimeInput: {
            mediaChunks: [{ data: base64Audio, mimeType: "audio/pcm" }],
          },
        }),
      );
    }
  }

  /**
   * Sends the results of tool/function executions back to the model.
   *
   * @param geminiWs - The active WebSocket connection.
   * @param functionResponses - Array of responses mapped to specific model function calls.
   */
  public sendToolResponse(
    geminiWs: WebSocket,
    functionResponses: Record<string, unknown>[],
  ) {
    if (geminiWs.readyState === WebSocket.OPEN) {
      const message = {
        toolResponse: {
          functionResponses: functionResponses,
        },
      };
      geminiWs.send(JSON.stringify(message));
    }
  }

  /**
   * Sends a text prompt to Gemini as client content.
   * Useful for initial greetings or forcing model actions during a voice session.
   *
   * @param geminiWs - The active WebSocket connection.
   * @param text - The text to send as human role content.
   */
  public sendText(geminiWs: WebSocket, text: string) {
    if (geminiWs.readyState === WebSocket.OPEN) {
      const message = {
        clientContent: {
          turns: [{ role: "user", parts: [{ text }] }],
          /**
           * CRITICAL: turnComplete must be true for the model to process
           * and start generating a response voice.
           */
          turnComplete: true,
        },
      };
      geminiWs.send(JSON.stringify(message));
    }
  }
}
