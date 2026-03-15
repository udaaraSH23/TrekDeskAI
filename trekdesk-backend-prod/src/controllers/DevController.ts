/**
 * @file DevController.ts
 * @description Controller for specialized development diagnostic tools and system introspection.
 * These endpoints provide deep visibility into the RAG pipeline and tool-calling logic.
 *
 * @module DevTools
 * @category Controllers
 */

import { Request, Response, NextFunction } from "express";
import { IDevService } from "../interfaces/services/IDevService";
import { ApiResponse } from "../utils/response/ApiResponse";
import { HttpStatus } from "../utils/httpStatusCodes";
import { TestPromptRequestDTO } from "../dtos/DevDTO";
import { BadRequestError } from "../utils/errors/CustomErrors";

/**
 * DevController
 *
 * Manages administrative endpoints used for debugging the AI engine.
 * Primarily used by the AI Debugger (Sandbox) in the Admin Dashboard.
 */
export class DevController {
  /**
   * @param devService - Service implementation for diagnostic logic.
   */
  constructor(private devService: IDevService) {}

  /**
   * POST /api/v1/dev/test-prompt
   *
   * Executes a standalone AI interaction and captures the full internal execution trace.
   * This includes tool calls, service results, and internal logical steps.
   *
   * @param req - Express request containing the natural language prompt.
   * @param res - Express response for standard JSON delivery.
   * @param next - Express next function for error propagation to global interceptors.
   * @returns Resolves to a detailed execution trace object.
   * @throws {BadRequestError} If the prompt is missing from the payload.
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
   *
   * Retrieves the current registry of tools that are exposed to the AI model.
   * Helps verify that function definitions and JSON schemas are correctly configured.
   *
   * @param _req - Unused Express request.
   * @param res - Express response containing the tool definitions.
   * @param next - Express next function for error handling.
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
   *
   * Provides a direct dump of calendar events for diagnostic purposes.
   * Used to verify that guide availability data is correctly sinking from the
   * Google Calendar API into the backend.
   *
   * @param _req - Unused Express request.
   * @param res - Express response containing raw calendar data.
   * @param next - Express next function for error handling.
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
