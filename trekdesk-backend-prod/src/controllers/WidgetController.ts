/**
 * @module WidgetControllers
 * @category Controllers
 */

import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../utils/errors/CustomErrors";
import { ApiResponse } from "../utils/response/ApiResponse";
import { HttpStatus } from "../utils/httpStatusCodes";
import { MVP_TENANT_ID } from "../config/constants";
import { IWidgetSettingsService } from "../interfaces/services/IWidgetSettingsService";

/**
 * Controller for handling HTTP requests related to widget configuration.
 * Managed through the Admin Dashboard interface.
 *
 * @class
 */
export class WidgetController {
  /**
   * @param widgetService Injected service for widget settings logic.
   */
  constructor(private widgetService: IWidgetSettingsService) {}

  /**
   * Endpoint: GET /v1/widget/settings
   * Retrieves the current configuration (colors, message, origins) for the tenant.
   *
   * @param req Express request.
   * @param res Express response.
   * @param next Express next function.
   * @returns {Promise<void>}
   */
  public async getSettings(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // In the current MVP, MVP_TENANT_ID is used as a global constant.
      const settings =
        await this.widgetService.getSettingsByTenant(MVP_TENANT_ID);

      if (!settings) {
        throw new NotFoundError("Widget settings not found");
      }

      ApiResponse.sendSuccess(
        res,
        HttpStatus.OK,
        "Widget settings retrieved successfully",
        settings,
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Endpoint: PUT /v1/widget/settings
   * Updates the widget configuration for the tenant.
   *
   * @param req Express request containing updated settings in body.
   * @param res Express response.
   * @param next Express next function.
   * @returns {Promise<void>}
   */
  public async updateSettings(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { primary_color, position, initial_message, allowed_origins } =
      req.body;

    try {
      const settings = await this.widgetService.updateSettings({
        tenant_id: MVP_TENANT_ID,
        primary_color,
        position,
        initial_message,
        allowed_origins,
      });

      ApiResponse.sendSuccess(
        res,
        HttpStatus.OK,
        "Widget settings updated successfully",
        settings,
      );
    } catch (err) {
      next(err);
    }
  }
}
