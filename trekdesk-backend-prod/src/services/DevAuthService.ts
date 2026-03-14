/**
 * @file DevAuthService.ts
 * @description Service for handling development-only authentication bypass.
 */
import { IDevAuthService } from "../interfaces/services/IDevAuthService";
import { IAuthService } from "../interfaces/services/IAuthService";
import { DevLoginResponseDTO } from "../dtos/DevAuthDTO";
import { env } from "../config/env";
import {
  UnauthorizedError,
  ForbiddenError,
} from "../utils/errors/CustomErrors";
import { AuthUser } from "../models/auth.schema";

export class DevAuthService implements IDevAuthService {
  private readonly DEV_USER: AuthUser = {
    id: "00000000-0000-0000-0000-000000000000",
    email: "dev-admin@trekdesk.ai",
    fullName: "Dev Administrator",
    pictureUrl: "https://avatar.vercel.sh/devadmin",
    tenantId: "11111111-1111-1111-1111-111111111111", // Standard Dev Tenant
  };

  constructor(private authService: IAuthService) {}

  /**
   * Validates a secret and generates a real JWT for the Dev Admin.
   */
  public async devLogin(secret: string): Promise<DevLoginResponseDTO> {
    // 1. Strict Industry Safety Guard: Only active in dev mode with explicit flag
    if (env.NODE_ENV === "production" || !env.ENABLE_DEVELOPMENT_LOGIN) {
      throw new ForbiddenError("Development login is strictly disabled.");
    }

    // 2. Secret Validation (Preventing brute-force or accidental exposure)
    if (!env.DEV_AUTH_SECRET || secret !== env.DEV_AUTH_SECRET) {
      throw new UnauthorizedError("Invalid development secret.");
    }

    // 3. Generate a real token using the standard signing logic
    const token = this.authService.generateToken(this.DEV_USER);

    return {
      user: this.DEV_USER,
      token,
      note: "This token is for testing purposes only and uses a dummy tenant ID.",
    };
  }
}
