import { Request, Response, NextFunction } from "express";
import { IDevService } from "../interfaces/services/IDevService";
import { ApiResponse } from "../utils/response/ApiResponse";
import { HttpStatus } from "../utils/httpStatusCodes";
import { TestPromptRequestDTO } from "../dtos/DevDTO";
import { BadRequestError } from "../utils/errors/CustomErrors";

/**
 * @class DevController
 * @description Controller for development diagnostic tools.
 */
export class DevController {
  constructor(private devService: IDevService) {}

  /**
   * POST /api/v1/dev/test-prompt
   * Simulates a conversation turn and returns the full tool execution trace.
   */
  public async testPrompt(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { prompt } = req.body as TestPromptRequestDTO;

      if (!prompt) {
        throw new BadRequestError("Prompt is required");
      }

      const result = await this.devService.testAiPrompt(prompt);

      ApiResponse.sendSuccess(res, HttpStatus.OK, "Test completed", result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/dev/tools
   * Returns the currently registered AI tool definitions.
   */
  public async getTools(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const tools = await this.devService.getRegisteredTools();
      ApiResponse.sendSuccess(res, HttpStatus.OK, "Tools retrieved", { tools });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/dev/calendar
   * Returns a list of calendar events for diagnostics.
   */
  public async getCalendar(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const events = await this.devService.getCalendarDiagnostics();
      ApiResponse.sendSuccess(res, HttpStatus.OK, "Calendar retrieved", {
        events,
      });
    } catch (err) {
      next(err);
    }
  }
}
