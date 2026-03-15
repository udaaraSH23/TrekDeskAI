/**
 * @module WidgetServices
 * @category Services
 */

import { IWidgetChatService } from "../interfaces/services/IWidgetChatService";
import { ChatMessageRequestDTO, ChatMessageResponseDTO } from "../dtos/ChatDTO";
import { ChatService } from "./ai/ChatService";
import { IWidgetSettingsRepository } from "../interfaces/repositories/IWidgetSettingsRepository";
import { AISettingsRepository } from "../repositories/AISettingsRepository";
import { ForbiddenError, NotFoundError } from "../utils/errors/CustomErrors";
import { logger } from "../utils/logger";

/**
 * Service that handles the business logic for the public-facing guest chat widget.
 * It manages security validation (CORS/Origins), AI personality fetching, and
 * high-level interaction orchestration.
 *
 * @class
 * @implements {IWidgetChatService}
 */
export class WidgetChatService implements IWidgetChatService {
  /**
   * @param chatService Shared core chat service for AI responses.
   * @param widgetSettingsRepo Repository for widget branding and domain security.
   * @param aiSettingsRepo Repository for AI system instructions (Persona).
   */
  constructor(
    private chatService: ChatService,
    private widgetSettingsRepo: IWidgetSettingsRepository,
    private aiSettingsRepo: AISettingsRepository,
  ) {}

  /**
   * Processes a message from the widget with origin validation and AI orchestration.
   * This method ensures the request comes from an authorized domain before
   * communicating with the AI.
   *
   * @param data Payload containing the user message and tenant identifier.
   * @param origin The HTTP origin header representing the third-party domain.
   * @returns {Promise<ChatMessageResponseDTO>} The AI's response text and trace details.
   *
   * @throws {NotFoundError} If the widget settings aren't configured for the tenant.
   * @throws {ForbiddenError} If the origin is not allowed by the widget's CORS settings.
   */
  public async processWidgetMessage(
    data: ChatMessageRequestDTO,
    origin?: string,
  ): Promise<ChatMessageResponseDTO> {
    const { message, tenantId } = data;

    // 1. Domain/Widget Security Validation
    // We load the tenant's security configuration from the database.
    const settings =
      await this.widgetSettingsRepo.getSettingsByTenant(tenantId);
    if (!settings) {
      throw new NotFoundError("Widget configuration not found");
    }

    // Origin Check: Allow if allowed_origins is empty, matches origin, or in local dev.
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

    // 2. Fetch personality (Persona) and generate AI response.
    // We retrieve the 'System Instruction' which defines the AI's behavior.
    const aiSettings = await this.aiSettingsRepo.getSettingsByTenant(tenantId);
    const systemInstruction =
      aiSettings?.system_instruction || "You are a helpful guide.";

    // Delegate core AI communication to the centralized ChatService.
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
