import {
  CreateTrekDTO,
  UpdateTrekDTO,
  DeleteTrekDTO,
  TrekResponseDTO,
} from "../../dtos/TrekDTO";

/**
 * Interface representing the business logic layer for Trek operations.
 */
export interface ITourService {
  /**
   * Retrieves all active treks available for a given tenant.
   * @param tenantId The UUID of the tenant/operator.
   * @returns Array of active treks.
   */
  getActiveTreks(tenantId: string): Promise<TrekResponseDTO[]>;

  /**
   * Retrieves detailed information for a specific trek.
   * @param trekId The UUID of the trek.
   * @param tenantId The UUID of the tenant/operator.
   * @returns Trek details or null if not found.
   */
  getTrekDetail(
    trekId: string,
    tenantId: string,
  ): Promise<TrekResponseDTO | null>;

  /**
   * Creates a new trek offering.
   * @param data The structure containing trek details (tenantId, name, price, etc).
   * @returns The created trek object.
   */
  createTrek(data: CreateTrekDTO): Promise<TrekResponseDTO>;

  /**
   * Modifies an existing trek's attributes.
   *
   * @param data - The UpdateTrekDTO containing new values and target ID.
   * @returns The updated TrekResponseDTO.
   */
  updateTrek(data: UpdateTrekDTO): Promise<TrekResponseDTO>;

  /**
   * Deactivates or removes a trek from the catalog.
   *
   * @param data - The DeleteTrekDTO.
   */
  deleteTrek(data: DeleteTrekDTO): Promise<void>;
}
