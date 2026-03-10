/**
 * @file TourService.ts
 * @description Service implementation for managing trek/tour operations.
 * Acts as the business logic layer between the API controllers and the data repository.
 * This service ensures that trek-specific operations are correctly scoped to tenants.
 */

import { ITourService } from "../interfaces/services/ITourService";
import { ITourRepository } from "../interfaces/repositories/ITourRepository";
import { CreateTrekPayload } from "../models/trek.schema";

/**
 * Service class responsible for trek-related business logic.
 *
 * The TourService handles the lifecycle and retrieval of treks (tours), which are the
 * core products offered by tour operators (tenants). It acts as a bridge to the
 * TourRepository, ensuring that all data access follows multi-tenancy rules.
 */
export class TourService implements ITourService {
  /**
   * Initializes the TourService with a repository for data persistence.
   * @param tourRepository - Repository implementation for interacting with the treks database.
   */
  constructor(private tourRepository: ITourRepository) {}

  /**
   * Retrieves a list of all active treks associated with a specific tenant.
   *
   * This method is primarily used for populating the product catalog on the frontend
   * or providing the AI assistant with a list of available offerings to pitch to leads.
   *
   * @param tenantId - The unique identifier (UUID) of the tenant/tour operator.
   * @returns A promise resolving to an array of active trek objects.
   */
  public async getActiveTreks(tenantId: string): Promise<any[]> {
    console.log(`[TourService] Fetching active treks for tenant: ${tenantId}`);
    return this.tourRepository.getActiveTreksByTenant(tenantId);
  }

  /**
   * Retrieves detailed information for a specific trek belonging to a tenant.
   *
   * Provides deep-dive data such as pricing, difficulty, and description.
   * The implementation logic (enforced in the repository) ensures that even if a trekId
   * is known, it cannot be accessed unless it belongs to the specified tenantId.
   *
   * @param trekId - The unique identifier (UUID) of the trek.
   * @param tenantId - The unique identifier (UUID) of the tenant/tour operator.
   * @returns A promise resolving to the trek details, or null if no matching trek is found.
   */
  public async getTrekDetail(
    trekId: string,
    tenantId: string,
  ): Promise<any | null> {
    console.log(
      `[TourService] Fetching trek detail for ID: ${trekId} (Tenant: ${tenantId})`,
    );
    return this.tourRepository.getTrekByIdAndTenant(trekId, tenantId);
  }

  /**
   * Creates a new trek offering for a specific tenant.
   *
   * Allows tour operators to expand their product catalog. Validations on the data structure
   * are expected to be handled by the controller/middleware before reaching this layer.
   *
   * @param data - The CreateTrekPayload containing all core details, including tenantId.
   * @returns A promise resolving to the newly created trek object as confirmed by the database.
   */
  public async createTrek(data: CreateTrekPayload): Promise<any> {
    console.log(`[TourService] Creating new trek for tenant: ${data.tenantId}`);
    return this.tourRepository.createTrek(data);
  }
}
