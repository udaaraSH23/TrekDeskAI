import { DevLoginResponseDTO } from "../../dtos/DevAuthDTO";

/**
 * Interface for development-only authentication bypass services.
 */
export interface IDevAuthService {
  /**
   * Validates a secret and generates a real JWT for the Dev Admin.
   *
   * @param secret - The secret key from the request.
   * @returns A promise resolving to the login details.
   */
  devLogin(secret: string): Promise<DevLoginResponseDTO>;
}
