/**
 * @file BookingService.ts
 * @description Service for managing trek bookings, availability checks, and quote generation.
 * This service handles the business logic for customer inquiries and booking workflows.
 */

import { IBookingService } from "../interfaces/services/IBookingService";
import { IBookingRepository } from "../interfaces/repositories/IBookingRepository";
import { ITourRepository } from "../interfaces/repositories/ITourRepository";
import { IGoogleCalendarService } from "../interfaces/services/IGoogleCalendarService";
import { CreateBookingDTO, BookingResponseDTO } from "../dtos/BookingDTO";

import { logger } from "../utils/logger";

/**
 * Service class for handling booking-related operations.
 * Scoped to a specific tenant to ensure multi-tenancy data isolation.
 */
export class BookingService implements IBookingService {
  /**
   * Creates an instance of BookingService.
   * @param tenantId - The unique identifier of the tenant context for this service instance.
   * @param bookingRepository - The injected repository instance matching IBookingRepository.
   * @param googleCalendarService - The Google Calendar service for sync and availability checks.
   * @param tourRepository - The injected repository instance for trek detail lookups.
   */
  constructor(
    private tenantId: string,
    private bookingRepository: IBookingRepository,
    private googleCalendarService: IGoogleCalendarService,
    private tourRepository: ITourRepository,
  ) {}

  /**
   * Securely manages the flow to formally reserve a hike.
   * Translates the validated conversational payload into a committed database record.
   *
   * @param payload - The conversational DTO to enforce required parameters.
   * @returns The generated Booking context row.
   */
  public async createBooking(
    payload: CreateBookingDTO,
  ): Promise<BookingResponseDTO> {
    logger.info(
      `[BookingService] Processing formal booking for ${payload.customerName} on Trek ${payload.trekId}`,
    );

    // Persist securely to PostgreSQL via the repository pipeline
    const newBooking = await this.bookingRepository.createBooking(payload);

    // Sync to Google Calendar
    try {
      await this.googleCalendarService.createEvent({
        summary: `Trek Booking: ${payload.customerName}`,
        description: `Booking for ${payload.customerName} (Phone: ${payload.customerPhone}) on Trek ID ${payload.trekId}`,
        start: new Date(payload.targetDate).toISOString(),
        end: new Date(
          new Date(payload.targetDate).getTime() + 4 * 60 * 60 * 1000,
        ).toISOString(), // 4h duration default
      });
    } catch (error) {
      logger.error(
        `[BookingService] Failed to sync booking to Google Calendar`,
        error,
      );
    }

    return newBooking;
  }

  /**
   * Checks the availability of treks for a specific date.
   *
   * @param data - DTO containing the target date for the trek inquiry.
   * @returns A Promise resolving to an object containing availability status.
   */
  public async checkAvailability(data: {
    date: string;
  }): Promise<{ status: string }> {
    logger.info(
      `[BookingService] Checking availability for ${data.date} on tenant ${this.tenantId}`,
    );

    // Check if the whole day or specific slots are busy.
    // For MVP, we'll check listing events for that day.
    try {
      const events = await this.googleCalendarService.listEvents(data.date);
      if (events.length >= 6) {
        // Simple logic: max 5 bookings per day
        return { status: "Fully Booked" };
      }
      return { status: "Available" };
    } catch (error) {
      logger.error(
        `[BookingService] Google Calendar check failed, falling back to mock`,
        error,
      );
      return { status: "Available" };
    }
  }

  /**
   * Generates a price quote for a trek based on the number of participants and transport requirements.
   * Leverages tiered pricing from the database and supports staged negotiation.
   *
   * @param data - DTO containing trekId, headcount, transport flags, and optional negotiation stage.
   * @returns A Promise resolving to the quote amount and detailed breakdown.
   */
  public async generateQuote(data: {
    trekId: string;
    pax: number;
    transport: boolean;
    negotiationStage?: string;
  }): Promise<{
    quote: string;
    breakdown: string;
    fallback_required?: boolean;
  }> {
    logger.info(
      `[BookingService] Generating quote for Trek ${data.trekId}, ${data.pax} people, stage: ${data.negotiationStage}`,
    );

    const trek = await this.tourRepository.getTrekByIdAndTenant(
      data.trekId,
      this.tenantId,
    );

    if (!trek) {
      throw new Error("Trek not found");
    }

    // Fallback if no tiered pricing is defined on the trek record
    if (!trek.pricing_tiers || trek.pricing_tiers.length === 0) {
      return {
        quote: "N/A",
        breakdown: `No structured pricing found for ${trek.name}.`,
        fallback_required: true,
      };
    }

    // Tier Matching Logic
    const matchingTier = trek.pricing_tiers.find((tier) => {
      const range = tier.pax_range;
      if (range.includes("-")) {
        const [min, max] = range.split("-").map(Number);
        return data.pax >= min && data.pax <= max;
      }
      if (range.includes("+")) {
        const min = Number(range.replace("+", ""));
        return data.pax >= min;
      }
      return Number(range) === data.pax;
    });

    if (!matchingTier) {
      return {
        quote: "N/A",
        breakdown: `We don't have a standard price for a group of ${data.pax}.`,
        fallback_required: true,
      };
    }

    // Negotiation Logic
    let basePricePerPerson = matchingTier.max_price;
    const stage = data.negotiationStage || "initial";

    if (stage === "discount") {
      // Offer a discount: max_price - 5, but not below min_price
      basePricePerPerson = Math.max(
        matchingTier.max_price - 5,
        matchingTier.min_price,
      );
    } else if (stage === "final") {
      // Give the lowest possible price
      basePricePerPerson = matchingTier.min_price;
    }

    const hireTotal = data.pax * basePricePerPerson;
    const transportTotal = data.transport ? trek.transport_fee || 0 : 0;
    const total = hireTotal + transportTotal;

    return {
      quote: `${total} USD`,
      breakdown: `Base: ${data.pax} x ${basePricePerPerson}, Transport: ${transportTotal}`,
    };
  }
}
