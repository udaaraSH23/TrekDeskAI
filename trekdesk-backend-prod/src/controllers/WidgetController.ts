import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../utils/errors/CustomErrors";
import { ApiResponse } from "../utils/response/ApiResponse";
import { HttpStatus } from "../utils/httpStatusCodes";
import { MVP_TENANT_ID } from "../config/constants";
import { IWidgetSettingsService } from "../interfaces/services/IWidgetSettingsService";

export class WidgetController {
  constructor(private widgetService: IWidgetSettingsService) {}

  public async getSettings(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
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
