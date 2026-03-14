/**
 * @file DevDTO.ts
 * @description Data Transfer Objects for the Development diagnostic module.
 */

/**
 * Request payload for testing an AI prompt.
 */
export interface TestPromptRequestDTO {
  /**
   * The text prompt/instruction to send to the AI.
   */
  prompt: string;
}

/**
 * Entry in the tool execution trace.
 */
export interface TraceEntry {
  /**
   * Whether this was a call from the AI or a response from a tool.
   */
  type: "tool_call" | "tool_response";
  /**
   * The name of the tool being executed.
   */
  name: string;
  /**
   * The arguments passed to the tool (for calls).
   */
  args?: Record<string, unknown>;
  /**
   * The result returned by the tool (for responses).
   */
  result?: unknown;
}

/**
 * Detailed response payload for the test prompt endpoint.
 */
export interface TestPromptResponseDTO {
  /**
   * The original prompt sent.
   */
  prompt: string;
  /**
   * The final text response from the AI.
   */
  response: string;
  /**
   * Systematic trace of all tool interactions that occurred.
   */
  trace: TraceEntry[];
  /**
   * Filtered logs captured during the execution for debugging.
   */
  logs: string[];
}

/**
 * Response payload for the tools list endpoint.
 */
export interface GetToolsResponseDTO {
  /**
   * List of currently registered AI tool declarations.
   */
  tools: Array<Record<string, unknown>>;
}

/**
 * Response payload for the calendar diagnostic endpoint.
 */
export interface GetCalendarResponseDTO {
  /**
   * List of calendar event objects retrieved from Google Calendar.
   */
  events: Array<Record<string, unknown>>;
}
