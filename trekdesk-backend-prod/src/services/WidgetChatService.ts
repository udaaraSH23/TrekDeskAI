import { IWidgetChatService } from "../interfaces/services/IWidgetChatService";
import { ChatMessageRequestDTO, ChatMessageResponseDTO } from "../dtos/ChatDTO";
import { ChatService } from "./ChatService";
import { IWidgetSettingsRepository } from "../interfaces/repositories/IWidgetSettingsRepository";
import { AISettingsRepository } from "../repositories/AISettingsRepository";
import { ForbiddenError, NotFoundError } from "../utils/errors/CustomErrors";
import { logger } from "../utils/logger";

/**
 * Service that handles the business logic for the public-facing chat widget.
 */
export class WidgetChatService implements IWidgetChatService {
  constructor(
    private chatService: ChatService,
    private widgetSettingsRepo: IWidgetSettingsRepository,
    private aiSettingsRepo: AISettingsRepository,
  ) {}

  /**
   * Processes a message from the widget with origin validation and AI orchestration.
   */
  public async processWidgetMessage(
    data: ChatMessageRequestDTO,
    origin?: string,
  ): Promise<ChatMessageResponseDTO> {
    const { message, tenantId } = data;

    // 1. Domain/Widget Security Validation
    const settings =
      await this.widgetSettingsRepo.getSettingsByTenant(tenantId);
    if (!settings) {
      throw new NotFoundError("Widget configuration not found");
    }

    const allowedOrigins = settings.allowed_origins || [];
    const isAllowed =
      allowedOrigins.length === 0 ||
      allowedOrigins.some((o: string) => origin?.includes(o)) ||
      process.env.NODE_ENV === "development";

    if (!isAllowed) {
      logger.warn(
        `[WidgetChatService] Unauthorized origin attempt: ${origin} for tenant ${tenantId}`,
      );
      throw new ForbiddenError(
        "The requesting origin is not authorized for this widget",
      );
    }

    // 2. Fetch personality and generate AI response
    const aiSettings = await this.aiSettingsRepo.getSettingsByTenant(tenantId);
    const systemInstruction =
      aiSettings?.system_instruction || "You are a helpful guide.";

    const aiResult = await this.chatService.getAiResponse(
      message,
      systemInstruction,
    );

    return {
      response: aiResult.response,
      trace: aiResult.trace as Array<Record<string, unknown>>,
      timestamp: new Date().toISOString(),
    };
  }
}
