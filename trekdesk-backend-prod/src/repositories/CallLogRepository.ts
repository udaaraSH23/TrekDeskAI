/**
 * @file CallLogRepository.ts
 * @description Data access logic for retrieving AI call logs and analytics.
 */
import { query } from "../config/database";
import { ICallLogRepository } from "../interfaces/repositories/ICallLogRepository";
import {
  CallLog,
  CallLogStats,
  UpdateCallLogPayload,
} from "../models/logs.schema";

/**
 * Repository implementation for retrieving agent conversation transcripts and summaries.
 * Interacts directly with the PostgreSQL database.
 */
export class CallLogRepository implements ICallLogRepository {
  /**
   * Retrieves all call logs for a specific tenant, ordered by the most recent conversation first.
   *
   * @param tenantId - The UUID of the tenant/tour operator.
   * @returns A Promise resolving to an array of call log rows.
   */
  public async getLogsByTenant(tenantId: string): Promise<CallLog[]> {
    const result = await query(
      "SELECT id, session_id, transcript, summary, sentiment_score, duration_seconds, created_at FROM call_logs WHERE tenant_id = $1 ORDER BY created_at DESC",
      [tenantId],
    );
    return result.rows as CallLog[];
  }

  /**
   * Retrieves a specific call log by its exact ID.
   * Strictly scopes the query by tenantId to prevent unauthorized log access.
   *
   * @param logId - The UUID of the requested log.
   * @param tenantId - The UUID of the tenant/tour operator.
   * @returns A Promise resolving to the call log object, or null if not found.
   */
  public async getLogByIdAndTenant(
    logId: string,
    tenantId: string,
  ): Promise<CallLog | null> {
    const result = await query(
      "SELECT * FROM call_logs WHERE id = $1 AND tenant_id = $2",
      [logId, tenantId],
    );
    return (result.rows[0] as CallLog) || null;
  }

  /**
   * Retrieves aggregated statistics for a tenant, calculating overall usage metrics
   * and identifying high value "hot leads" via sentiment scoring.
   *
   * @param tenantId - The UUID of the tenant/tour operator.
   * @returns A Promise resolving to a CallLogStats DTO containing aggregated data.
   */
  public async getStatsByTenant(tenantId: string): Promise<CallLogStats> {
    const countRes = await query(
      "SELECT COUNT(*) FROM call_logs WHERE tenant_id = $1",
      [tenantId],
    );

    const leadRes = await query(
      `SELECT id, session_id, sentiment_score, created_at, summary 
       FROM call_logs 
       WHERE tenant_id = $1 AND sentiment_score > 0.7
       ORDER BY created_at DESC 
       LIMIT 5`,
      [tenantId],
    );

    return {
      totalCalls: parseInt(countRes.rows[0].count, 10) || 0,
      hotLeads: leadRes.rows,
      leadsCount: leadRes.rowCount || 0,
    };
  }

  /**
   * Initializes a new empty call session in the database.
   */
  public async createLog(tenantId: string, sessionId: string): Promise<void> {
    await query(
      "INSERT INTO call_logs (tenant_id, session_id) VALUES ($1, $2) RETURNING id",
      [tenantId, sessionId],
    );
  }

  /**
   * Appends the finalized statistics and transcription to an existing session trace.
   */
  public async updateLog(payload: UpdateCallLogPayload): Promise<void> {
    await query(
      `UPDATE call_logs 
       SET transcript = $1, 
           summary = $2, 
           sentiment_score = $3, 
           duration_seconds = $4 
       WHERE session_id = $5 AND tenant_id = $6`,
      [
        JSON.stringify(payload.transcript),
        payload.summary,
        payload.sentimentScore,
        payload.durationSeconds,
        payload.sessionId,
        payload.tenantId,
      ],
    );
  }
}
