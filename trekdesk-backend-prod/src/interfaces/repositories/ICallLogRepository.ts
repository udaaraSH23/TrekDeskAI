import { CallLogStats } from "../../models/logs.schema";

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
  getLogsByTenant(tenantId: string): Promise<any[]>;

  /**
   * Fetches the specific, detailed transcript and trace of a single AI session.
   *
   * @param logId - The UUID of the precise session target.
   * @param tenantId - The UUID guard constraint ensuring data privacy.
   * @returns A Promise resolving to the complex log object, or null.
   */
  getLogByIdAndTenant(logId: string, tenantId: string): Promise<any | null>;

  /**
   * Processes macroscopic trends across all logs, evaluating AI success rates and hot lead identification.
   *
   * @param tenantId - The analytical scope UUID.
   * @returns A Promise resolving to the structured CallLogStats object.
   */
  getStatsByTenant(tenantId: string): Promise<CallLogStats>;
}
