/**
 * @file ToolDispatcher.ts
 * @description Central controller for mapping AI model function calls to backend services.
 * Orchestrates the execution of external tools like calendar checks, quoting, and knowledge retrieval.
 */

import { IBookingService } from "../interfaces/services/IBookingService";
import { IKnowledgeService } from "../interfaces/services/IKnowledgeService";
import { MVP_TENANT_ID } from "../config/constants";
import { logger } from "../utils/logger";
import { GeminiFunctionCall } from "../types/gemini";

/**
 * Dispatcher class that routes AI-generated function calls to their respective service handlers.
 */
export class ToolDispatcher {
  /**
   * Creates an instance of ToolDispatcher.
   * @param bookingService - Instance of BookingService to handle transactional operations.
   * @param knowledgeService - Instance of KnowledgeService to handle specific trek questions.
   */
  constructor(
    private bookingService: IBookingService,
    private knowledgeService: IKnowledgeService,
  ) {}

  /**
   * Processes a function call request and routes it to the correct service.
   *
   * @param functionCall - Object containing the tool name and arguments provided by the AI model.
   * @returns A Promise resolving to the result of the tool execution.
   */
  public async dispatch(functionCall: GeminiFunctionCall): Promise<unknown> {
    const { name, args } = functionCall;

    switch (name) {
      case "check_guide_calendar":
        /** Handles availability inquiries for specific dates */
        return await this.bookingService.checkAvailability({
          date: args.date as string,
        });

      case "generate_quote":
        /** Calculates price quotes based on headcount and transport needs */
        return await this.bookingService.generateQuote({
          pax: args.pax as number,
          transport: args.transport as boolean,
        });

      case "generate_weather_itinerary":
        /** Triggers generation of visual documents (itineraries/quotes) */
        return await this.bookingService.generateVisual({
          type: args.type as string,
          trekName: args.trek_name as string,
        });

      case "query_knowledge_base": {
        /** Performs semantic search across the specialized knowledge base */
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
        /** Converts verbal AI conversational intent into a committed PostgreSQL database booking row */
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
            message: `Booking successfully secured for ${args.customer_name} on ${args.date}.`,
          };
        } catch (error: unknown) {
          logger.error(`[ToolDispatcher] Booking Failed:`, error);
          return {
            status: "error",
            message: `Could not complete the booking. Missing requirements or system error.`,
          };
        }

      default:
        /** Fallback for unrecognized tools to prevent system crashes */
        logger.warn(`[ToolDispatcher] Unknown tool: ${name}`);
        return { error: "Unknown tool" };
    }
  }
}
