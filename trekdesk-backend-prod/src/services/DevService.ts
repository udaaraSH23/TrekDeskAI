import { IDevService } from "../interfaces/services/IDevService";
import { TestPromptResponseDTO, TraceEntry } from "../dtos/DevDTO";
import { ChatService } from "./ChatService";
import { AISettingsRepository } from "../repositories/AISettingsRepository";
import { GoogleCalendarService } from "./GoogleCalendarService";
import { tools as toolDefinitions } from "../config/tools";
import { MVP_TENANT_ID } from "../config/constants";
import { logger } from "../utils/logger";

/**
 * Implementation of development diagnostic tools.
 * Encapsulates complex AI orchestration and system tracing.
 */
export class DevService implements IDevService {
  constructor(
    private chatService: ChatService,
    private aiSettingsRepo: AISettingsRepository,
    private calendarService: GoogleCalendarService,
  ) {}

  /**
   * Orchestrates a traced AI turn while capturing internal tool logs.
   */
  public async testAiPrompt(prompt: string): Promise<TestPromptResponseDTO> {
    const logs: string[] = [];

    // Monkey-patch logger for the duration of this call
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
      const aiSettings =
        await this.aiSettingsRepo.getSettingsByTenant(MVP_TENANT_ID);
      const systemInstruction =
        aiSettings?.system_instruction || "You are a helpful guide.";

      const aiResult = await this.chatService.getAiResponse(
        prompt,
        systemInstruction,
      );

      return {
        prompt,
        response: aiResult.response,
        trace: aiResult.trace as TraceEntry[],
        logs: logs.filter(
          (l) =>
            l.includes("[ToolDispatcher]") ||
            l.includes("[BookingService]") ||
            l.includes("[TourService]"),
        ),
      };
    } finally {
      // Restore original logger
      logger.info = originalInfo;
    }
  }

  /**
   * Returns current tool definitions.
   */
  public async getRegisteredTools(): Promise<Array<Record<string, unknown>>> {
    return toolDefinitions as unknown as Array<Record<string, unknown>>;
  }

  /**
   * Fetches diagnostic calendar events.
   */
  public async getCalendarDiagnostics(): Promise<
    Array<Record<string, unknown>>
  > {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 5);

    const end = new Date(today);
    end.setDate(today.getDate() + 25);

    const events = await this.calendarService.listEventsRange(
      start.toISOString(),
      end.toISOString(),
    );

    return (events || []) as unknown as Array<Record<string, unknown>>;
  }
}
