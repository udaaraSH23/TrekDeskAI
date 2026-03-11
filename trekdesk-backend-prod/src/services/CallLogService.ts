/**
 * @file CallLogService.ts
 * @description Business logic layer for managing call logs and analytics.
 */
import { ICallLogService } from "../interfaces/services/ICallLogService";
import { ICallLogRepository } from "../interfaces/repositories/ICallLogRepository";
import {
  CallLogStats,
  CreateCallLogPayload,
  EndCallSessionPayload,
} from "../models/logs.schema";

/**
 * Implementation of the `ICallLogService`.
 * Acts as the centralized business logic pipeline between the transport layer
 * and the database layer for anything related to conversional analytics.
 */
export class CallLogService implements ICallLogService {
  /**
   * @param callLogRepository - Injected dependency handling physical DB operations.
   */
  constructor(private callLogRepository: ICallLogRepository) {}

  /**
   * Retrieves a list of historical session records, ordered sequentially.
   *
   * @param tenantId - Tour Operator identity boundary.
   * @returns Array of structured raw transcript rows.
   */
  public async getLogsByTenant(tenantId: string): Promise<any[]> {
    return this.callLogRepository.getLogsByTenant(tenantId);
  }

  /**
   * Securely requests comprehensive detail of a specific AI interaction.
   * Utilizes the tenantId as a strict security barrier preventing unauthorized viewing.
   *
   * @param logId - Target Call Session primary key.
   * @param tenantId - Verification identity boundary.
   * @returns The call object, or null if it violates access bounds.
   */
  public async getLogByIdAndTenant(
    logId: string,
    tenantId: string,
  ): Promise<any | null> {
    return this.callLogRepository.getLogByIdAndTenant(logId, tenantId);
  }

  /**
   * Processes the macro trends of AI phone calls. Identifies top candidates
   * and usage metrics critical for display on the SaaS administrative dashboard.
   *
   * @param tenantId - Tour Operator identity boundary.
   * @returns The aggregated CallLogStats DTO.
   */
  public async getStatsByTenant(tenantId: string): Promise<CallLogStats> {
    return this.callLogRepository.getStatsByTenant(tenantId);
  }

  /**
   * Instructs the DB payload pipeline to establish an empty session trace log.
   * Useful to track disconnected drops vs completed calls in future iterations.
   *
   * @param payload - Object containing tenantId and sessionId.
   */
  public async startCallSession(payload: CreateCallLogPayload): Promise<void> {
    await this.callLogRepository.createLog(payload.tenantId, payload.sessionId);
  }

  /**
   * Orchestrates the complex termination logic of an AI Voice Call.
   * Determines sentiment scoring utilizing a rule-based algorithmic MVP approach (can evaluate an LLM proxy later).
   * Generates formatted summaries and permanently seals the conversational record.
   *
   * @param payload - Setup metrics regarding the terminated session.
   */
  public async endCallSession(payload: EndCallSessionPayload): Promise<void> {
    // Note: In an enterprise/production environment, this text would be sent to an LLM
    // (via an Agent abstraction) for zero-shot natural language summarization and sentiment analysis.
    // For this prototype, statistical keyword presence determines initial polarity.

    const lowerText = payload.transcriptText.toLowerCase();

    let sentimentScore = 0.5; // neutral baseline start
    if (
      lowerText.includes("book") ||
      lowerText.includes("amazing") ||
      lowerText.includes("interested")
    ) {
      sentimentScore = 0.8; // Positive intent signals
    }
    if (
      lowerText.includes("too expensive") ||
      lowerText.includes("no thanks") ||
      lowerText.includes("bad")
    ) {
      sentimentScore = 0.3; // Negative friction signals
    }

    const summary = `Automated recording. Call completion lasting ${payload.durationSeconds} seconds.`;

    await this.callLogRepository.updateLog({
      sessionId: payload.sessionId,
      tenantId: payload.tenantId,
      transcript: { full_text: payload.transcriptText },
      summary,
      sentimentScore,
      durationSeconds: payload.durationSeconds,
    });
  }
}
