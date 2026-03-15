/**
 * @module WidgetInterfaces
 * @category Interfaces
 */

import {
  ChatMessageRequestDTO,
  ChatMessageResponseDTO,
} from "../../dtos/ChatDTO";

/**
 * Interface for the business logic layer of the public chat widget.
 * Specifically handles the secure processing of guest messages.
 */
export interface IWidgetChatService {
  /**
   * Processes an incoming message from the widget, performing validation and AI orchestration.
   * This is the primary entry point for guest interactions on third-party sites.
   *
   * @param data - The request payload containing the user's 'message' and 'tenantId'.
   * @param origin - The HTTP 'Origin' header of the request used for domain validation.
   * @returns A promise resolving to the AI's response and conversation trace.
   * @throws {NotFoundError} If the tenant's widget configuration is missing.
   * @throws {ForbiddenError} If the request origin is not in the allowed list.
   */
  processWidgetMessage(
    data: ChatMessageRequestDTO,
    origin?: string,
  ): Promise<ChatMessageResponseDTO>;
}
