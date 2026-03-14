import { Request, Response, NextFunction } from "express";
import { IDevAuthService } from "../interfaces/services/IDevAuthService";
import { ApiResponse } from "../utils/response/ApiResponse";
import { HttpStatus } from "../utils/httpStatusCodes";
import { DevLoginRequestDTO } from "../dtos/DevAuthDTO";

/**
 * @class DevAuthController
 * @description Controller for development-only authentication bypass logic.
 */
export class DevAuthController {
  constructor(private devAuthService: IDevAuthService) {}

  /**
   * POST /api/v1/dev/login
   * Validates a secret key and returns a real JWT for the Dev Admin.
   */
  public async devLogin(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { secret } = req.body as DevLoginRequestDTO;

      const result = await this.devAuthService.devLogin(secret);

      ApiResponse.sendSuccess(
        res,
        HttpStatus.OK,
        "Development Login Successful",
        result,
      );
    } catch (err) {
      next(err);
    }
  }
}
