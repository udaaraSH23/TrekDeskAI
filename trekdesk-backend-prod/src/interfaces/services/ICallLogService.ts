/**
 * @file ICallLogService.ts
 * @description Interface definition for CallLog business logic.
 */
import {
  CallLogStats,
  CreateCallLogPayload,
  EndCallSessionPayload,
} from "../../models/logs.schema";

/**
 * Defines the contract for the business logic layer handling AI Call Logs.
 * Responsible for aggregating analytics, retrieving transcripts, and
 * managing the lifecycle of an active voice session's data representation.
 */
export interface ICallLogService {
  /**
   * Retrieves a descending chronological list of all phone logs for a given tenant.
   *
   * @param tenantId - The unique identifier of the tour operator/tenant.
   * @returns A promise resolving to an array of log objects.
   */
  getLogsByTenant(tenantId: string): Promise<any[]>;

  /**
   * Retrieves the comprehensive detail view of a singular call log.
   * Enforces security by checking the tenant constraint.
   *
   * @param logId - The unique ID of the target call log.
   * @param tenantId - The unique identifier of the tour operator/tenant.
   * @returns A promise resolving to the log object or null if not found.
   */
  getLogByIdAndTenant(logId: string, tenantId: string): Promise<any | null>;

  /**
   * Returns high-level business metrics summarizing call volume,
   * sentiment scores, and identified top-tier leads.
   *
   * @param tenantId - The unique identifier of the tour operator/tenant.
   * @returns A promise resolving to a CallLogStats aggregate object.
   */
  getStatsByTenant(tenantId: string): Promise<CallLogStats>;

  /**
   * Registers the start of a brand new live AI session in the database.
   * This is called immediately upon a successful WebSocket connection.
   *
   * @param payload - The structure containing tenantId and sessionId.
   * @returns A promise resolving when the record initialized successfully.
   */
  startCallSession(payload: CreateCallLogPayload): Promise<void>;

  /**
   * Formalizes the completion of an AI call.
   * Processes the raw transcript, calculates synthetic analytics like sentiment,
   * generates a textual summary, and commits the finalized record back to the DB.
   *
   * @param payload - The object containing termination metrics and identity.
   * @returns A promise resolving when the log is completely finalized.
   */
  endCallSession(payload: EndCallSessionPayload): Promise<void>;
}
