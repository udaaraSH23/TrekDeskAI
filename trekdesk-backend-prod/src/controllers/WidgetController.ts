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
import { env } from "../config/env";

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

  /**
   * Endpoint: GET /v1/widget/embed/chat
   * Renders a simple HTML wrapper for the widget iframe.
   * This allows the backend to set CSP headers before the browser loads the frontend.
   *
   * @param req Express request.
   * @param res Express response.
   * @param next Express next function.
   * @returns {Promise<void>}
   */
  public async renderEmbed(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const agentId = (req.query.agentId as string) || MVP_TENANT_ID;
      const apiUrl = req.query.apiUrl as string;
      const color = req.query.color as string;
      const msg = req.query.msg as string;
      const name = req.query.name as string;

      // Construct the URL for the actual widget hosted on Frontend
      // Note: We use the same parameters passed to us
      const frontendBaseUrl =
        process.env.NODE_ENV === "production"
          ? env.FRONTEND_URL
          : "http://localhost:5173";

      const targetUrl = `${frontendBaseUrl}/embed/chat?agentId=${agentId}&apiUrl=${encodeURIComponent(apiUrl || "")}&color=${encodeURIComponent(color || "")}&msg=${encodeURIComponent(msg || "")}&name=${encodeURIComponent(name || "")}`;

      // Return a simple HTML wrapper that loads the real widget in an iframe
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>TrekDesk AI Chat</title>
          <style>
            body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: transparent; }
            iframe { border: none; width: 100%; height: 100%; background: transparent; }
          </style>
        </head>
        <body>
          <iframe src="${targetUrl}" allow="microphone; clipboard-write; autoplay"></iframe>
        </body>
        </html>
      `;

      res.setHeader("Content-Type", "text/html");

      // Construct Permissions-Policy
      // In development, we use '*' for less friction. In production, we restrict to self and frontend.
      const allowedOrigin =
        process.env.NODE_ENV === "production" ? `"${frontendBaseUrl}"` : "*";

      res.setHeader(
        "Permissions-Policy",
        `microphone=(self ${allowedOrigin}), clipboard-write=(self ${allowedOrigin}), autoplay=(self ${allowedOrigin})`,
      );
      res.status(200).send(html);
    } catch (err) {
      next(err);
    }
  }
}
