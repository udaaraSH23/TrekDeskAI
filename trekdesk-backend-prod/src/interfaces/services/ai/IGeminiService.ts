import WebSocket from "ws";
import { AISettings } from "../../../types/ai";
import { GeminiResponse } from "../../../types/gemini";

/**
 * Interface representing the integration logic with the Google Gemini Realtime API.
 * Manages WebSocket lifecycles and biometric/audio data streaming.
 */
export interface IGeminiService {
  /**
   * Establishes a bidirectional WebSocket connection to the Gemini multimodal endpoint.
   *
   * @param onMessage - Callback triggered when the AI sends a message/audio response.
   * @param onClose - Callback triggered when the connection naturally or forcefully terminates.
   * @param settings - The active persona settings dictating the AI's behavior.
   * @returns A Promise resolving to the active WebSocket instance.
   */
  connectToGemini(
    onMessage: (response: GeminiResponse) => void,
    onClose: () => void,
    settings: AISettings,
  ): Promise<WebSocket>;

  /**
   * Streams base64 encoded audio buffers to the active Gemini WebSocket.
   *
   * @param geminiWs - The active WebSocket connection.
   * @param base64Audio - The raw audio payload captured from the client.
   */
  sendAudio(geminiWs: WebSocket, base64Audio: string): void;

  /**
   * Transmits the results of a client-side or backend tool execution back to the AI.
   * Essential for multi-turn function calling (e.g., returning calendar availability).
   *
   * @param geminiWs - The active WebSocket connection.
   * @param functionResponses - The structured output array resulting from tool executions.
   */
  sendToolResponse(
    geminiWs: WebSocket,
    functionResponses: Record<string, unknown>[],
  ): void;

  /**
   * Sends a text part to Gemini as client content.
   * Useful for initial greetings or text-based prompts during a voice session.
   *
   * @param geminiWs - The active WebSocket connection.
   * @param text - The text message to send.
   */
  sendText(geminiWs: WebSocket, text: string): void;
}
