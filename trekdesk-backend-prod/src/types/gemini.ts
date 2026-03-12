/**
 * @file gemini.ts
 * @description Type definitions for the Gemini Multimodal Live API.
 */

export interface GeminiFunctionCall {
  id?: string;
  name: string;
  args: Record<string, unknown>;
}

export interface GeminiToolResponse {
  functionResponses: {
    response: unknown;
    id?: string;
  }[];
}

export interface GeminiResponse {
  serverContent?: {
    modelTurn?: {
      parts?: {
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
        call?: GeminiFunctionCall;
      }[];
    };
  };
  toolCall?: {
    functionCalls: GeminiFunctionCall[];
  };
  setupComplete?: boolean;
}

export interface ToolDeclaration {
  functionDeclarations: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, unknown>;
      required: string[];
    };
  }[];
}
