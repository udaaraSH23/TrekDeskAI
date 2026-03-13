import {
  CreateTrekPayload,
  TrekRecord,
  UpdateTrekPayload,
  DeleteTrekPayload,
} from "../../models/trek.schema";

/**
 * Interface representing the business logic layer for Trek operations.
 */
export interface ITourService {
  /**
   * Retrieves all active treks available for a given tenant.
   * @param tenantId The UUID of the tenant/operator.
   * @returns Array of active treks.
   */
  getActiveTreks(tenantId: string): Promise<TrekRecord[]>;

  /**
   * Retrieves detailed information for a specific trek.
   * @param trekId The UUID of the trek.
   * @param tenantId The UUID of the tenant/operator.
   * @returns Trek details or null if not found.
   */
  getTrekDetail(trekId: string, tenantId: string): Promise<TrekRecord | null>;

  /**
   * Creates a new trek offering.
   * @param data The structure containing trek details (tenantId, name, price, etc).
   * @returns The created trek object.
   */
  createTrek(data: CreateTrekPayload): Promise<TrekRecord>;
  /**
   * Modifies an existing trek's attributes.
   *
   * @param data - The UpdateTrekPayload containing new values and target ID.
   * @returns The updated TrekRecord.
   */
  updateTrek(data: UpdateTrekPayload): Promise<TrekRecord>;

  /**
   * Deactivates or removes a trek from the catalog.
   *
   * @param data - The DeleteTrekPayload DTO.
   */
  deleteTrek(data: DeleteTrekPayload): Promise<void>;
}
