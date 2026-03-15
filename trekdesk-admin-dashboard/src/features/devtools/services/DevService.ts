/**
 * @file DevService.ts
 * @description Service layer for internal diagnostic and debugging tools.
 * Provides access to AI tool registries, direct prompt testing, and system integration logs.
 *
 * @module DevTools
 * @category Services
 */

import api from "../../../services/api";
import type { ApiSuccessResponse } from "../../../types/api.types";

/**
 * Represents a single step in the AI's logical execution journey.
 * Helps developers visualize tool-calling decisions and their results.
 */
export interface TraceEntry {
  /** Distinguishes between sending a command to a tool vs receiving back data */
  type: "tool_call" | "tool_response";
  /** The identifier of the tool being interacted with */
  name: string;
  /** Input arguments sent to the AI tool (for 'tool_call' type) */
  args?: Record<string, unknown>;
  /** The raw result data returned by the backend service (for 'tool_response' type) */
  result?: unknown;
}

/**
 * Encapsulates the full lifecycle of a diagnostic prompt execution.
 */
export interface DebugResult {
  /** The original natural language input tested */
  prompt: string;
  /** The final generated response from the AI model */
  response: string;
  /** Sequential list of every internal tool interaction during this request */
  trace: TraceEntry[];
  /** Standard out/error logs captured from the backend durante orchestration */
  logs: string[];
}

/**
 * Schema information for an AI-registered function/tool.
 */
export interface ToolInfo {
  /** Unique name of the tool (e.g., 'get_trek_details') */
  name: string;
  /** Human-readable explanation of what the tool does */
  description: string;
  /** JSON schema definition for the expected input arguments */
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
}

/**
 * Represents a simplified calendar event for availability checking diagnostics.
 */
export interface CalendarEvent {
  /** Title or subject of the appointment */
  summary: string;
  /** Start time of the event (ISO string or date) */
  start: { dateTime?: string; date?: string };
  /** End time of the event (ISO string or date) */
  end: { dateTime?: string; date?: string };
}

/**
 * DevService
 *
 * Centralized service for developer-only operations. These endpoints are
 * typically disabled or restricted in production environments.
 */
export const DevService = {
  /**
   * Retrieves the current registry of AI tools defined on the backend.
   * Useful for verifying that new tool definitions are correctly registered and detected.
   *
   * @returns A Promise resolving to an array of tool/function declarations.
   */
  async getTools(): Promise<ToolInfo[]> {
    interface ToolResponse {
      functionDeclarations: ToolInfo[];
    }
    const response =
      await api.get<ApiSuccessResponse<{ tools: ToolResponse[] }>>(
        "/dev/tools",
      );
    if (response.data.data.tools?.length > 0) {
      return response.data.data.tools.flatMap((t) => t.functionDeclarations);
    }
    return [];
  },

  /**
   * Diagnostic fetch of guide availability from Google Calendar.
   * Helps verify integration health without initiating a full AI session.
   *
   * @returns A Promise resolving to a list of upcoming calendar events.
   */
  async getCalendar(): Promise<CalendarEvent[]> {
    const response =
      await api.get<ApiSuccessResponse<{ events: CalendarEvent[] }>>(
        "/dev/calendar",
      );
    return response.data.data.events || [];
  },

  /**
   * Executes a manual test prompt through the AI pipeline.
   * This bypasses voice/WebSocket layers and provides a full execution trace
   * for troubleshooting tool-calling logic and prompt engineering.
   *
   * @param prompt - The natural language text to test.
   * @returns A Promise resolving to the AI response and execution trace.
   */
  async testPrompt(prompt: string): Promise<DebugResult> {
    const response = await api.post<ApiSuccessResponse<DebugResult>>(
      "/dev/test-prompt",
      {
        prompt,
      },
    );
    return response.data.data;
  },
};
