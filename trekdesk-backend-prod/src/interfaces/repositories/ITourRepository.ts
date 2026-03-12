import { CreateTrekPayload, TrekRecord } from "../../models/trek.schema";

/**
 * Interface definition for the Tour/Trek data repository.
 * Abstracts database interactions concerning the catalog of experiences offered by operators.
 */
export interface ITourRepository {
  /**
   * Retrieves all active, public-facing treks offered by a specific tenant.
   *
   * @param tenantId - The UUID of the specific tour operator.
   * @returns A Promise resolving to a mapped array of trek objects.
   */
  getActiveTreksByTenant(tenantId: string): Promise<TrekRecord[]>;

  /**
   * Retrieves the detailed profile of a single trek, strictly guarded by tenant ownership.
   *
   * @param trekId - The UUID of the targeted trek.
   * @param tenantId - The UUID of the operator attempting access.
   * @returns A Promise resolving to the trek details, or null if unauthorized/notFound.
   */
  getTrekByIdAndTenant(
    trekId: string,
    tenantId: string,
  ): Promise<TrekRecord | null>;

  /**
   * Persists a newly created trek object into the operator's catalog.
   *
   * @param data - The structured CreateTrekPayload enforcing multi-tenant mapping.
   * @returns A Promise resolving to the fully instantiated trek from the database.
   */
  createTrek(data: CreateTrekPayload): Promise<TrekRecord>;
}
