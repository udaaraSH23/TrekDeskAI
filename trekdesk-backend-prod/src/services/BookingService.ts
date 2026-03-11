/**
 * @file BookingService.ts
 * @description Service for managing trek bookings, availability checks, and quote generation.
 * This service handles the business logic for customer inquiries and booking workflows.
 */

import { IBookingService } from "../interfaces/services/IBookingService";
import { IBookingRepository } from "../interfaces/repositories/IBookingRepository";
import { BookingRow, CreateBookingPayload } from "../models/booking.schema";

/**
 * Service class for handling booking-related operations.
 * Scoped to a specific tenant to ensure multi-tenancy data isolation.
 */
export class BookingService implements IBookingService {
  /**
   * Creates an instance of BookingService.
   * @param tenantId - The unique identifier of the tenant context for this service instance.
   * @param bookingRepository - The injected repository instance matching IBookingRepository.
   */
  constructor(
    private tenantId: string,
    private bookingRepository: IBookingRepository,
  ) {}

  /**
   * Securely manages the flow to formally reserve a hike.
   * Translates the validated conversational payload into a committed database record.
   *
   * @param payload - The conversational DTO to enforce required parameters.
   * @returns The generated Booking context row.
   */
  public async createBooking(
    payload: CreateBookingPayload,
  ): Promise<BookingRow> {
    console.log(
      `[BookingService] Processing formal booking for ${payload.customerName} on Trek ${payload.trekId}`,
    );

    // Persist securely to PostgreSQL via the repository pipeline
    const newBooking = await this.bookingRepository.createBooking(payload);

    // NOTE: In a broader production application, this is where we would trigger
    // WebSocket events to update the SaaS dashboard, or dispatch an email via SendGrid.
    return newBooking;
  }

  /**
   * Checks the availability of treks for a specific date.
   *
   * @param data - DTO containing the target date for the trek inquiry.
   * @returns A Promise resolving to an object containing availability status.
   * @note Currently using mock logic. Integration with Google Calendar is planned.
   */
  public async checkAvailability(data: { date: string }): Promise<any> {
    console.log(
      `[BookingService] Checking availability for ${data.date} on tenant ${this.tenantId}`,
    );
    // REAL implementation will involve: google.calendar.events.list({ ... })
    return { status: "Available" };
  }

  /**
   * Generates a price quote for a trek based on the number of participants and transport requirements.
   *
   * @param data - DTO containing headcount and transport flags.
   * @returns A Promise resolving to the quote amount and detailed breakdown.
   * @note Currently using hardcoded prices. Production version will fetch rates from the database.
   */
  public async generateQuote(data: {
    pax: number;
    transport: boolean;
  }): Promise<any> {
    console.log(
      `[BookingService] Generating quote for ${data.pax} people, transport: ${data.transport}`,
    );
    // REAL implementation will involve: query('SELECT base_price_per_person, transport_fee FROM treks WHERE ...')
    const total = data.pax * 5000 + (data.transport ? 2000 : 0);
    return {
      quote: `${total} LKR`,
      breakdown: `Base: ${data.pax * 5000}, Transport: ${data.transport ? 2000 : 0}`,
    };
  }

  /**
   * Generates a visual asset (e.g., PDF itinerary or quote) for a specific trek.
   *
   * @param data - DTO containing type and trekName.
   * @returns A Promise resolving to the asset status and a download URL.
   */
  public async generateVisual(data: {
    type: string;
    trekName: string;
  }): Promise<any> {
    console.log(
      `[BookingService] Generating ${data.type} for ${data.trekName}`,
    );
    return {
      status: "success",
      download_url: `https://storage.googleapis.com/trekdesk-assets/${data.type}/sample.pdf`,
      message: `I've generated a downloadable ${data.type} for your trek to ${data.trekName}.`,
    };
  }
}
