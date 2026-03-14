import { Request, Response, NextFunction } from "express";

import { IWidgetChatService } from "../interfaces/services/IWidgetChatService";
import { ApiResponse } from "../utils/response/ApiResponse";
import { HttpStatus } from "../utils/httpStatusCodes";
import { ChatMessageRequestDTO } from "../dtos/ChatDTO";

/**
 * Controller responsible for managing public-facing chat interactions.
 * This controller serves as the entry point for messages coming from the embedded TrekDesk widget.
 */
export class ChatController {
  /**
   * Initializes a new instance of the ChatController.
   *
   * @param widgetChatService - Business logic service for widget interactions.
   */
  constructor(private widgetChatService: IWidgetChatService) {}

  /**
   * Handles an incoming chat message from a public widget.
   *
   * @route POST /api/v1/chat/message
   * @param req - Express Request object containing {@link ChatMessageRequestDTO} in body.
   * @param res - Express Response object.
   * @param next - Express NextFunction for centralized error propagation.
   */
  public async handleMessage(
    req: Request<
      Record<string, unknown>,
      Record<string, unknown>,
      ChatMessageRequestDTO
    >,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const origin = req.headers.origin;

      const responseData = await this.widgetChatService.processWidgetMessage(
        req.body,
        origin,
      );

      ApiResponse.sendSuccess(
        res,
        HttpStatus.OK,
        "Message handled successfully",
        responseData,
      );
    } catch (error) {
      next(error);
    }
  }
}
