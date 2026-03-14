import {
  ChatMessageRequestDTO,
  ChatMessageResponseDTO,
} from "../../dtos/ChatDTO";

/**
 * Interface for the business logic layer of the public chat widget.
 */
export interface IWidgetChatService {
  /**
   * Processes an incoming message from the widget, performing validation and AI orchestration.
   *
   * @param data - The request payload (message and tenantId).
   * @param origin - The HTTP origin of the request for security verification.
   * @returns A promise resolving to the AI response payload.
   */
  processWidgetMessage(
    data: ChatMessageRequestDTO,
    origin?: string,
  ): Promise<ChatMessageResponseDTO>;
}
