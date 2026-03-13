/**
 * @file TourRepository.ts
 * @description Repository for performing database operations on treks and tours.
 */
import { query } from "../config/database";
import { ITourRepository } from "../interfaces/repositories/ITourRepository";
import {
  CreateTrekPayload,
  DeleteTrekPayload,
  TrekRecord,
  UpdateTrekPayload,
} from "../models/trek.schema";

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
  public async getActiveTreksByTenant(tenantId: string): Promise<TrekRecord[]> {
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
  public async getTrekByIdAndTenant(
    trekId: string,
    tenantId: string,
  ): Promise<TrekRecord | null> {
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
  public async createTrek(data: CreateTrekPayload): Promise<TrekRecord> {
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

  /**
   * Updates an existing trek catalog entry.
   */
  public async updateTrek(data: UpdateTrekPayload): Promise<TrekRecord> {
    const result = await query(
      `UPDATE treks 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           base_price_per_person = COALESCE($3, base_price_per_person),
           transport_fee = COALESCE($4, transport_fee),
           difficulty_level = COALESCE($5, difficulty_level)
       WHERE id = $6 AND tenant_id = $7
       RETURNING *`,
      [
        data.name ?? null,
        data.description ?? null,
        data.base_price_per_person ?? null,
        data.transport_fee ?? null,
        data.difficulty_level ?? null,
        data.trekId,
        data.tenantId,
      ],
    );
    return result.rows[0];
  }

  /**
   * Deactivates/Deletes a trek from the catalog.
   */
  public async deleteTrek(data: DeleteTrekPayload): Promise<void> {
    const { trekId, tenantId } = data;
    // For the MVP, we perform a hard delete. In production, consider soft deletes (updating an is_deleted flag).
    await query("DELETE FROM treks WHERE id = $1 AND tenant_id = $2", [
      trekId,
      tenantId,
    ]);
  }
}
