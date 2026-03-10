/**
 * @file GeminiService.ts
 * @description integration with Google's Gemini Multimodal Live API via WebSockets.
 * Handles real-time audio streaming, system instruction setup, and tool call responses.
 */

import WebSocket from "ws";
import dotenv from "dotenv";
import { AISettings, ToolCall } from "../types/ai";
import { IGeminiService } from "../interfaces/services/IGeminiService";

dotenv.config();

/**
 * API Key retrieved from environment variables for authenticating with Google AI services.
 */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Service class for managing bidirectional communication with the Gemini API.
 */
export class GeminiService implements IGeminiService {
  /** The WebSocket URL for Gemini's Generative Service BidiGenerateContent endpoint */
  private wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;

  /**
   * Creates an instance of GeminiService.
   * @param tools - Array of tool definitions (function declarations) the model can invoke.
   */
  constructor(private tools: any[]) {}

  /**
   * Establishes a WebSocket connection to Gemini and initializes the session with setup parameters.
   *
   * @param onMessage - Callback function triggered when a response is received from the model.
   * @param onClose - Callback function triggered when the connection is closed.
   * @param settings - Configuration settings including system instructions and voice selection.
   * @returns A Promise resolving to the established WebSocket instance.
   */
  public async connectToGemini(
    onMessage: (response: any) => void,
    onClose: () => void,
    settings: AISettings,
  ): Promise<WebSocket> {
    const geminiWs = new WebSocket(this.wsUrl);

    geminiWs.on("open", () => {
      console.log("[GeminiService] Connected to Google Live API");

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
                prebuiltVoiceConfig: { voiceName: settings.voiceName },
              },
            },
          },
        },
      };
      geminiWs.send(JSON.stringify(setupMessage));
    });

    geminiWs.on("message", (data) => {
      const response = JSON.parse(data.toString());
      onMessage(response);
    });

    geminiWs.on("close", (code, reason) => {
      console.log(`[GeminiService] Disconnected: ${code} - ${reason}`);
      onClose();
    });

    geminiWs.on("error", (err) => {
      console.error("[GeminiService] Error:", err);
    });

    return geminiWs;
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
  public sendToolResponse(geminiWs: WebSocket, functionResponses: any[]) {
    if (geminiWs.readyState === WebSocket.OPEN) {
      geminiWs.send(
        JSON.stringify({
          toolResponse: {
            functionResponses: functionResponses,
          },
        }),
      );
    }
  }
}
