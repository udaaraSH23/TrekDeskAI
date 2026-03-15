/**
 * @file ToolDispatcher.ts
 * @description Central controller for mapping AI model function calls to backend services.
 * This class acts as the "Switchboard" of the AI system, routing intents identified
 * by the LLM to specific domain services like Booking, Knowledge, or Tours.
 *
 * @module Services/AI/ToolDispatcher
 * @category AI
 */

import { IBookingService } from "../../interfaces/services/ai/IBookingService";
import { IKnowledgeService } from "../../interfaces/services/IKnowledgeService";
import { ITourService } from "../../interfaces/services/ITourService";
import { MVP_TENANT_ID } from "../../config/constants";
import { logger } from "../../utils/logger";
import { GeminiFunctionCall } from "../../types/gemini";

/**
 * Dispatcher class responsible for executing the logic associated with AI tool calls.
 * It strictly adheres to the function definitions provided in the `tools.ts` manifest.
 */
export class ToolDispatcher {
  /**
   * Creates an instance of ToolDispatcher.
   * Leverages Dependency Injection for all required business services.
   *
   * @param bookingService - Handles availability, quotes, and transactional reservations.
   * @param knowledgeService - Handles semantic search and FAQ retrieval (RAG).
   * @param tourService - Handles master data lookups for available trek packages.
   */
  constructor(
    private bookingService: IBookingService,
    private knowledgeService: IKnowledgeService,
    private tourService: ITourService,
  ) {}

  /**
   * Routes a model-generated function call to its corresponding service implementation.
   * Extracts arguments, applies multi-tenancy context (tenantId), and returns structured results.
   *
   * @param functionCall - The raw function call object received from the Gemini API.
   * @returns A Promise resolving to the result of the tool execution (to be sent back to AI).
   *
   * @note The 'name' parameter must exactly match the declarations in `src/config/tools.ts`.
   */
  public async dispatch(functionCall: GeminiFunctionCall): Promise<unknown> {
    const { name, args } = functionCall;
    logger.info(`[ToolDispatcher] Executing tool: ${name}`);

    switch (name) {
      case "get_available_treks":
        /**
         * Context: Essential for "Discovery" phase.
         * Allows the AI to fetch valid master data so it can provide correct trek IDs to the user.
         */
        return await this.tourService.getActiveTreks(MVP_TENANT_ID);

      case "check_guide_calendar":
        /**
         * Context: Availability check using Google Calendar integration.
         * Resolves the 'date' argument extracted by the AI from natural language.
         */
        return await this.bookingService.checkAvailability({
          date: args.date as string,
        });

      case "generate_quote":
        /**
         * Context: Dynamic pricing calculation.
         * Supports tiered pricing and negotiation stages (initial, discount, final).
         */
        return await this.bookingService.generateQuote({
          trekId: args.trek_id as string,
          pax: args.pax as number,
          transport: args.transport as boolean,
          negotiationStage: args.negotiation_stage as string,
        });

      case "query_knowledge_base": {
        /**
         * Context: RAG (Retrieval-Augmented Generation) pipeline.
         * Performs vector similarity search to answer factual or nuanced trek questions.
         */
        logger.info(
          `[ToolDispatcher] Searching knowledge base for: ${args.query}`,
        );
        const results = await this.knowledgeService.search({
          q: args.query as string,
        });
        return {
          status: "success",
          results:
            results.length > 0
              ? results
              : ["No specific information found in the guide book."],
        };
      }

      case "book_trek":
        /**
         * Context: Transactional commitment.
         * Finalizes the conversational intent into a committed database record and calendar sync.
         */
        logger.info(
          `[ToolDispatcher] AI dispatching booking for: ${args.customer_name}`,
        );
        try {
          const bookingRes = await this.bookingService.createBooking({
            tenantId: MVP_TENANT_ID,
            trekId: args.trek_id as string,
            pax: args.pax as number,
            targetDate: args.date as string,
            customerName: args.customer_name as string,
            customerPhone: args.customer_phone as string,
            customerEmail: (args.customer_email as string) || undefined,
          });
          return {
            status: "success",
            booking_id: bookingRes.id,
            message: `Booking successfully secured for ${args.customer_name} on ${args.date} for the "${bookingRes.trekName || "selected trek"}". A 4-hour slot has been blocked on the guide's calendar, and a team member will contact you shortly to finalize details.`,
          };
        } catch (error: unknown) {
          logger.error(`[ToolDispatcher] Booking Failed:`, error);
          return {
            status: "error",
            message: `Could not complete the booking. Missing requirements or system error.`,
          };
        }

      default:
        /**
         * Fallback mechanism for unexpected tool triggers.
         * Logs the event and returns a safe error payload to the model.
         */
        logger.warn(`[ToolDispatcher] Unknown tool reported by AI: ${name}`);
        return { error: "Unknown tool" };
    }
  }
}
