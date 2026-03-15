/**
 * @file DevService.ts
 * @description Implementation of development diagnostic and system introspection tools.
 * Provides high-fidelity tracing of AI tool-calling and direct system integration testing.
 *
 * @module DevTools
 * @category Services
 */

import { IDevService } from "../interfaces/services/IDevService";
import { TestPromptResponseDTO, TraceEntry } from "../dtos/DevDTO";
import { ChatService } from "./ai/ChatService";
import { AISettingsRepository } from "../repositories/AISettingsRepository";
import { GoogleCalendarService } from "./GoogleCalendarService";
import { tools as toolDefinitions } from "../config/tools";
import { MVP_TENANT_ID } from "../config/constants";
import { logger } from "../utils/logger";

/**
 * DevService
 *
 * Handles internal diagnostic operations designed for administrative and developer oversight.
 * This service mediates between the raw AI engine and a structured debugging interface,
 * allowing for isolated logic testing and performance monitoring.
 */
export class DevService implements IDevService {
  /**
   * @param chatService - Orchestrator for the Gemini AI pipeline and tool dispatcher.
   * @param aiSettingsRepo - Access point for persistent AI system instructions.
   * @param calendarService - Direct integration with Google Calendar for availability diagnostics.
   */
  constructor(
    private chatService: ChatService,
    private aiSettingsRepo: AISettingsRepository,
    private calendarService: GoogleCalendarService,
  ) {}

  /**
   * Orchestrates a traced AI turn while capturing internal tool logs.
   * Uses a temporary log interception pattern to correlate backend events
   * with a specific user prompt without requiring a full session state.
   *
   * @param prompt - The input text provided by the developer sandbox.
   * @returns A Promise resolving to the full execution trace and captured debug logs.
   */
  public async testAiPrompt(prompt: string): Promise<TestPromptResponseDTO> {
    const logs: string[] = [];

    // Monkey-patch logger.info for the duration of this specific call.
    // This allows us to capture granular tool-execution logs that are normally
    // streamed to Winston, and redirect them into the HTTP response for the debugger UI.
    const originalInfo = logger.info.bind(logger);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (logger as any).info = (
      msg: string | Record<string, unknown>,
      ...args: Array<Record<string, unknown>>
    ) => {
      const logMsg = typeof msg === "string" ? msg : JSON.stringify(msg);
      logs.push(logMsg + (args.length ? " " + JSON.stringify(args) : ""));
      return originalInfo(msg as string, ...args);
    };

    try {
      // Retrieve the effective system persona for this tenant
      const aiSettings =
        await this.aiSettingsRepo.getSettingsByTenant(MVP_TENANT_ID);
      const systemInstruction =
        aiSettings?.system_instruction || "You are a helpful guide.";

      // Execute the AI pipeline (this triggers ToolDispatcher logic)
      const aiResult = await this.chatService.getAiResponse(
        prompt,
        systemInstruction,
      );

      return {
        prompt,
        response: aiResult.response,
        trace: aiResult.trace as TraceEntry[],
        // Filter for specific service markers to keep the debug trace clean.
        // We focus on core domains that significantly impact AI decision making.
        logs: logs.filter(
          (l) =>
            l.includes("[ToolDispatcher]") ||
            l.includes("[BookingService]") ||
            l.includes("[TourService]"),
        ),
      };
    } finally {
      // CRITICAL: Always restore the original logger to prevent memory leaks
      // or global side effects in the running process.
      logger.info = originalInfo;
    }
  }

  /**
   * Returns the current static tool definitions used for tool-binding.
   * Used by the UI to render the 'Registered AI Tools' catalog.
   *
   * @returns A Promise resolving to an array of tool function declarations.
   */
  public async getRegisteredTools(): Promise<Array<Record<string, unknown>>> {
    return toolDefinitions as unknown as Array<Record<string, unknown>>;
  }

  /**
   * Fetches diagnostic calendar events for a broad window (30-day range).
   * Verifies Google Calendar OAuth health and data consistency.
   *
   * @returns A Promise resolving to an array of raw calendar events.
   */
  public async getCalendarDiagnostics(): Promise<
    Array<Record<string, unknown>>
  > {
    const today = new Date();
    const start = new Date(today);
    // Include 5 days past to verify historical sync status
    start.setDate(today.getDate() - 5);

    const end = new Date(today);
    // Include 25 days future for comprehensive availability oversight
    end.setDate(today.getDate() + 25);

    const events = await this.calendarService.listEventsRange(
      start.toISOString(),
      end.toISOString(),
    );

    return (events || []) as unknown as Array<Record<string, unknown>>;
  }
}
