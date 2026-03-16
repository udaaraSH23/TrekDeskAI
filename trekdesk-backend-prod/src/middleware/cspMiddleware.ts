import { Request, Response, NextFunction } from "express";
import { widgetSettingsRepository } from "../config/di";
import { logger } from "../utils/logger";

/**
 * Middleware to dynamically set the Content-Security-Policy header
 * based on the tenant's allowed_origins for the widget.
 */
export const dynamicCspMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Get agentId (tenantId) from query params
    const agentId = req.query.agentId as string;

    // Default origins that are always allowed
    const baseOrigins = [
      "'self'",
      "https://trekdesk.web.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ];

    let allowedOrigins = [...baseOrigins];

    if (agentId) {
      // 2. Look up the agent's allowed_origins in the database
      const settings =
        await widgetSettingsRepository.getSettingsByTenant(agentId);

      if (
        settings &&
        settings.allowed_origins &&
        Array.isArray(settings.allowed_origins)
      ) {
        // Add database origins to the list
        allowedOrigins = [
          ...new Set([...allowedOrigins, ...settings.allowed_origins]),
        ];
      }
    }

    // 3. Construct CSP header
    // frame-ancestors defines who is allowed to iframe this response
    const cspHeader = `frame-ancestors ${allowedOrigins.join(" ")}`;

    // Set the header
    res.setHeader("Content-Security-Policy", cspHeader);

    // Also set the legacy X-Frame-Options to allow framing if CSP is present
    // Note: CSP 'frame-ancestors' takes precedence in modern browsers
    res.removeHeader("X-Frame-Options");

    next();
  } catch (error) {
    logger.error(`[CSP Middleware] Error: ${error}`);
    // Fallback to safe defaults on error
    res.setHeader(
      "Content-Security-Policy",
      "frame-ancestors 'self' https://trekdesk.web.app http://localhost:5173 http://localhost:3000",
    );
    next();
  }
};
