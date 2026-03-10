/**
 * TrekDesk AI - Voice Session Handler
 *
 * This module manages individual real-time voice sessions between a client
 * (typically the web widget) and the Gemini Multimodal Live API. It handles
 * the bidirectional streaming of audio, execution of tool calls, and state
 * synchronization.
 */

import { WebSocket } from "ws";
import { GeminiService } from "../services/GeminiService";
import { toolDispatcher, aiSettingsRepository } from "../config/di";
import { AISettings } from "../types/ai";
import { MVP_TENANT_ID } from "../config/constants";
import { tools } from "../config/tools";

// Shared Google Gemini service instance configured with defined system tools
const geminiService = new GeminiService(tools);

/**
 * Handles an incoming WebSocket connection for a voice session.
 *
 * This logic follows a specific orchestration flow:
 * 1. Fetch tenant-specific AI settings (persona, voice, instructions).
 * 2. Establish a persistent stream with Google's Gemini Multimodal Live API.
 * 3. Wire up bidirectional message passing between the client and Gemini.
 *
 * @param ws The client WebSocket connection.
 */
export const handleVoiceConnection = async (ws: WebSocket) => {
  console.log("[Server] Incoming Multimodal Voice Connection");

  try {
    /**
     * Session Initialization: Load AI Settings
     * Retrieves the persona and vocal identity from the database.
     * This allows for dynamic updates to the AI's behavior via the Admin Dashboard.
     */
    const settingsRes =
      await aiSettingsRepository.getSettingsByTenant(MVP_TENANT_ID);

    const settings: AISettings = {
      voiceName: settingsRes?.voice_name || "Aoede",
      systemInstruction:
        settingsRes?.system_instruction ||
        "You are a helpful guide for Kandy Treks.",
      temperature: 0.7,
    };

    /**
     * Connect to Gemini API
     * Opens a WebSocket stream to Google. The callback handles responses
     * coming back from the AI model in real-time.
     */
    const geminiWs = await geminiService.connectToGemini(
      async (response) => {
        /**
         * Scenario 1: AI generates media (Audio/Text)
         * Forward the raw model turn (e.g., PCM audio chunks) to the client.
         */
        if (response.serverContent?.modelTurn) {
          ws.send(JSON.stringify(response.serverContent.modelTurn));
        }

        /**
         * Scenario 2: AI requests tool execution
         * The model has decided to use a function (e.g., search knowledge base).
         * We execute the function locally and send the result back to Gemini
         * so it can incorporate the facts into its next response.
         */
        if (response.toolCall) {
          console.log("[Server] Tool Calls Received", response.toolCall);
          const functionCalls = response.toolCall.functionCalls;
          const functionResponses = [];

          for (const call of functionCalls) {
            const result = await toolDispatcher.dispatch(call);
            functionResponses.push({
              id: call.id,
              name: call.name,
              response: result,
            });
          }

          // Send observations back to the AI model
          geminiService.sendToolResponse(geminiWs, functionResponses);
        }
      },
      // Error/Disconnect Callback
      () => ws.close(),
      settings,
    );

    /**
     * Handle Incoming Client Messages
     * Listens for audio chunks or control messages from the web widget.
     */
    ws.on("message", (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        // Forward client audio stream directly to Gemini
        if (parsed.audio) {
          geminiService.sendAudio(geminiWs, parsed.audio);
        }
      } catch (e) {
        console.error("[Server] Client message parsing error");
      }
    });

    /**
     * Session Cleanup
     * Ensures all external connections (like the Gemini stream) are
     * properly disposed of when the client disconnects.
     */
    ws.on("close", () => {
      geminiWs.close();
      console.log("[Server] Voice session closed");
    });
  } catch (err) {
    console.error("[Server] Session initialization error:", err);
    ws.close();
  }
};
