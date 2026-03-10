import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../utils/errors/CustomErrors";
import { ApiResponse } from "../utils/response/ApiResponse";
import { HttpStatus } from "../utils/httpStatusCodes";
import { MVP_TENANT_ID } from "../config/constants";
import { IAISettingsRepository } from "../interfaces/repositories/IAISettingsRepository";

/**
 * Controller handling HTTP requests related to the AI Persona setup.
 * Manages the fetching and updating of AI behavioral definitions.
 */
export class PersonaController {
  constructor(private aiSettingsRepository: IAISettingsRepository) {}

  /**
   * GET /api/persona/settings
   * Retrieves the current AI interaction settings (voice, instructions, temperature).
   *
   * @param req - Express request object.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  public async getSettings(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const settings =
        await this.aiSettingsRepository.getSettingsByTenant(MVP_TENANT_ID);

      if (!settings) {
        throw new NotFoundError("AI settings not found");
      }

      ApiResponse.sendSuccess(
        res,
        HttpStatus.OK,
        "Settings retrieved successfully",
        settings,
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT/PATCH /api/persona/settings
   * Updates or creates the functional behavior of the AI agent for the tenant.
   *
   * @param req - Express request object containing the updated instruction payload.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  public async updateSettings(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { voice_name, system_instruction, temperature } = req.body;

    try {
      const settings = await this.aiSettingsRepository.updateSettings({
        tenant_id: MVP_TENANT_ID,
        voice_name,
        system_instruction,
        temperature,
      });

      ApiResponse.sendSuccess(
        res,
        HttpStatus.OK,
        "Settings updated successfully",
        settings,
      );
    } catch (err) {
      next(err);
    }
  }
}
