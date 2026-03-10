import { query } from "../config/database";
import { ITourRepository } from "../interfaces/repositories/ITourRepository";
import { CreateTrekPayload } from "../models/trek.schema";

/**
 * Repository implementation for managing Trek/Tour entities.
 * Interacts directly with the PostgreSQL database.
 */
export class TourRepository implements ITourRepository {
  /**
   * Retrieves all active treks associated with a specific tenant.
   * Only treks marked as `is_active` are returned for production use.
   *
   * @param tenantId - The UUID of the tenant/tour operator.
   * @returns A Promise resolving to an array of active trek objects.
   */
  public async getActiveTreksByTenant(tenantId: string) {
    const result = await query(
      "SELECT * FROM treks WHERE tenant_id = $1 AND is_active = TRUE",
      [tenantId],
    );
    return result.rows;
  }

  /**
   * Retrieves specific details for a single trek by its ID, ensuring it belongs to the tenant.
   * This multi-tenant guard prevents unauthorized access to other operators' treks.
   *
   * @param trekId - The UUID of the trek.
   * @param tenantId - The UUID of the tenant/tour operator.
   * @returns A Promise resolving to the trek object, or null if not found.
   */
  public async getTrekByIdAndTenant(trekId: string, tenantId: string) {
    const result = await query(
      "SELECT * FROM treks WHERE id = $1 AND tenant_id = $2",
      [trekId, tenantId],
    );
    return result.rows[0] || null;
  }

  /**
   * Creates a new trek catalog entry in the database.
   *
   * @param data - The CreateTrekPayload DTO containing validated trek details and the bounding tenantId.
   * @returns A Promise resolving to the newly inserted database row.
   */
  public async createTrek(data: CreateTrekPayload) {
    const result = await query(
      `INSERT INTO treks (tenant_id, name, description, base_price_per_person, transport_fee, difficulty_level)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.tenantId,
        data.name,
        data.description,
        data.base_price_per_person,
        data.transport_fee,
        data.difficulty_level,
      ],
    );
    return result.rows[0];
  }
}
