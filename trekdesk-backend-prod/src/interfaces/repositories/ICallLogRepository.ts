import {
  CallLog,
  CallLogStats,
  UpdateCallLogPayload,
  DeleteCallLogPayload,
} from "../../models/logs.schema";

/**
 * Interface definition for the interactions surrounding AI session Call Logs.
 * Handles the historical persistence and statistical reduction of past customer interactions.
 */
export interface ICallLogRepository {
  /**
   * Pulls the descending chronological list of all phone logs tied to an operator.
   *
   * @param tenantId - The UUID of the operator evaluating their analytics.
   * @returns A Promise resolving to a list of historical session records.
   */
  getLogsByTenant(tenantId: string): Promise<CallLog[]>;

  /**
   * Fetches the specific, detailed transcript and trace of a single AI session.
   *
   * @param logId - The UUID of the precise session target.
   * @param tenantId - The UUID guard constraint ensuring data privacy.
   * @returns A Promise resolving to the complex log object, or null.
   */
  getLogByIdAndTenant(logId: string, tenantId: string): Promise<CallLog | null>;

  /**
   * Processes macroscopic trends across all logs, evaluating AI success rates and hot lead identification.
   *
   * @param tenantId - The analytical scope UUID.
   * @returns A Promise resolving to the structured CallLogStats object.
   */
  getStatsByTenant(tenantId: string): Promise<CallLogStats>;

  /**
   * Initializes a new call log trace row upon session start.
   *
   * @param tenantId - The UUID of the operator.
   * @param sessionId - A unique string representing the voice connection.
   */
  createLog(tenantId: string, sessionId: string): Promise<void>;

  /**
   * Finalizes the call log trace array with full transcription and analytics.
   *
   * @param sessionId - A unique string representing the voice connection.
   * @param tenantId - The UUID of the operator.
   * @param transcript - The JSON object storing the conversation.
   * @param summary - A text synopsis of the call.
   * @param sentimentScore - A rating (e.g. 0 to 1).
   * @param durationSeconds - The total time in seconds the call lasted.
   */
  updateLog(payload: UpdateCallLogPayload): Promise<void>;
  /**
   * Deletes a call log entry from the database.
   *
   * @param data - The DeleteCallLogPayload DTO.
   */
  deleteLog(data: DeleteCallLogPayload): Promise<void>;
}
