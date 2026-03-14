import api from "../../../services/api";
import type { ApiSuccessResponse } from "../../../types/api.types";

export interface TraceEntry {
  type: "tool_call" | "tool_response";
  name: string;
  args?: Record<string, unknown>;
  result?: unknown;
}

export interface DebugResult {
  prompt: string;
  response: string;
  trace: TraceEntry[];
  logs: string[];
}

export interface ToolInfo {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
}

export interface CalendarEvent {
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

export const DevService = {
  /**
   * Fetches the registered AI tools from the backend.
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
   * Fetches guide availability from Google Calendar.
   */
  async getCalendar(): Promise<CalendarEvent[]> {
    const response =
      await api.get<ApiSuccessResponse<{ events: CalendarEvent[] }>>(
        "/dev/calendar",
      );
    return response.data.data.events || [];
  },

  /**
   * Runs a test prompt through the AI engine and returns the execution trace.
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
