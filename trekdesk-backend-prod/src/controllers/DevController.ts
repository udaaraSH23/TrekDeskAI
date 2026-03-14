import { Request, Response, NextFunction } from "express";

import { IDevService } from "../interfaces/services/IDevService";
import { ApiResponse } from "../utils/response/ApiResponse";
import { HttpStatus } from "../utils/httpStatusCodes";
import { TestPromptRequestDTO } from "../dtos/DevDTO";

/**
 * Controller providing diagnostic and testing tools for developers.
 *
 * @important These endpoints are restricted to development environments.
 */
export class DevController {
  /**
   * Initializes a new instance of the DevController.
   *
   * @param devService - Implementation of development-focused diagnostic tools.
   */
  constructor(private devService: IDevService) {}

  /**
   * Executes a supervised AI conversation turn with full tracing and log capture.
   *
   * @route POST /api/v1/dev/test-prompt
   * @param req - Express Request containing {@link TestPromptRequestDTO}.
   * @param res - Express Response.
   * @param next - Error propagation.
   */
  public async testPrompt(
    req: Request<
      Record<string, unknown>,
      Record<string, unknown>,
      TestPromptRequestDTO
    >,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const payload = await this.devService.testAiPrompt(req.body.prompt);

      ApiResponse.sendSuccess(
        res,
        HttpStatus.OK,
        "AI Diagnostic completed",
        payload,
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves the current registry of AI-accessible tool definitions.
   *
   * @route GET /api/v1/dev/tools
   * @param _req - Express Request.
   * @param res - Express Response.
   */
  public async getTools(_req: Request, res: Response): Promise<void> {
    const tools = await this.devService.getRegisteredTools();
    ApiResponse.sendSuccess(res, HttpStatus.OK, "Tools retrieved", { tools });
  }

  /**
   * Tests Google Calendar integration by retrieving events for a fixed time range.
   *
   * @route GET /api/v1/dev/calendar
   * @param _req - Express Request.
   * @param res - Express Response.
   * @param next - Error propagation.
   */
  public async getCalendar(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const events = await this.devService.getCalendarDiagnostics();

      ApiResponse.sendSuccess(
        res,
        HttpStatus.OK,
        "Calendar diagnostics retrieved",
        { events },
      );
    } catch (err) {
      next(err);
    }
  }
}
