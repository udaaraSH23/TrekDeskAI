/**
 * @file ChatService.ts
 * @description Shared service for handling AI interactions via the Gemini Multimodal Live API.
 */
import WebSocket from "ws";
import { GeminiService } from "./GeminiService";
import { ToolDispatcher } from "./ToolDispatcher";
import { tools as toolDefinitions } from "../config/tools";
import { GeminiFunctionCall, ToolDeclaration } from "../types/gemini";

export interface ChatResponse {
  response: string;
  trace: { type: string; name: string; args?: unknown; result?: unknown }[];
}

/**
 * Service to manage AI conversations and tool execution.
 */
export class ChatService {
  constructor(private toolDispatcher: ToolDispatcher) {}

  /**
   * Orchestrates a multi-turn conversation with Gemini.
   *
   * @param prompt - The user's input text.
   * @param systemInstruction - Guidelines for the model's behavior.
   * @returns A promise resolving to the model's final response and tool execution trace.
   */
  public async getAiResponse(
    prompt: string,
    systemInstruction: string,
  ): Promise<ChatResponse> {
    const trace: {
      type: string;
      name: string;
      args?: unknown;
      result?: unknown;
    }[] = [];
    let turnCount = 0;
    const MAX_TURNS = 10;

    const settings = {
      voiceName: "Aoede",
      systemInstruction,
      temperature: 0.7,
    };

    const gemini = new GeminiService(toolDefinitions as ToolDeclaration[]);
    let activeWs: WebSocket | null = null;

    return new Promise((resolve, reject) => {
      let finalResponse = "";
      const timeout = setTimeout(() => {
        if (activeWs && activeWs.readyState === WebSocket.OPEN) {
          activeWs.close();
        }
        reject(new Error("AI response timed out"));
      }, 20000);

      gemini
        .connectToGemini(
          async (response) => {
            if (response.serverContent?.modelTurn) {
              const parts = response.serverContent.modelTurn.parts || [];
              for (const p of parts) {
                if (p.text) finalResponse += p.text;
              }
            }

            if (response.toolCall && activeWs) {
              turnCount++;
              if (turnCount > MAX_TURNS) {
                if (activeWs.readyState === WebSocket.OPEN) activeWs.close();
                return reject(new Error("Maximum tool turns exceeded"));
              }

              const functionCalls = response.toolCall.functionCalls;
              const toolResponses: {
                id?: string;
                response: { result: unknown };
              }[] = [];

              for (const call of functionCalls) {
                trace.push({
                  type: "tool_call",
                  name: call.name,
                  args: call.args,
                });

                const toolResult = await this.toolDispatcher.dispatch(
                  call as GeminiFunctionCall,
                );

                trace.push({
                  type: "tool_response",
                  name: call.name,
                  result: toolResult,
                });
                toolResponses.push({
                  id: call.id,
                  response: { result: toolResult },
                });
              }

              gemini.sendToolResponse(activeWs, toolResponses);
            }
          },
          () => {
            clearTimeout(timeout);
            resolve({ response: finalResponse, trace });
          },
          settings,
        )
        .then((ws) => {
          activeWs = ws;
          gemini.sendText(ws, prompt);

          // Auto-close logic
          const checkDone = setInterval(() => {
            if (finalResponse.length > 0) {
              clearInterval(checkDone);
              setTimeout(() => {
                if (ws.readyState === WebSocket.OPEN) ws.close();
              }, 3000);
            }
          }, 500);

          setTimeout(() => {
            clearInterval(checkDone);
            if (ws.readyState === WebSocket.OPEN) ws.close();
          }, 15000);
        })
        .catch((err) => {
          clearTimeout(timeout);
          reject(err);
        });
    });
  }
}
