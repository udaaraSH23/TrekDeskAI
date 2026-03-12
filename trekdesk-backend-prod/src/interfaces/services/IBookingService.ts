/**
 * Interface representing the business logic layer for transactional booking operations.
 * Handles mock or real integrations for calendar availability and quote generation, as well as real bookings.
 */
import { BookingRow, CreateBookingPayload } from "../../models/booking.schema";

export interface IBookingService {
  /**
   * Finalizes and securely persists a verified tour booking request.
   *
   * @param payload - Safely parsed DTO containing the user's details and target trek.
   * @returns A Promise resolving to the finished DB row containing the unique booking ID.
   */
  createBooking(payload: CreateBookingPayload): Promise<BookingRow>;
  /**
   * Checks the availability of tour guides/treks for a specific date.
   *
   * @param data - DTO containing the target date string (e.g., "YYYY-MM-DD").
   * @returns A Promise resolving to an availability status object.
   */
  checkAvailability(data: { date: string }): Promise<{ status: string }>;

  /**
   * Generates a dynamic price quote combining base trek costs and optional transport fees.
   *
   * @param data - DTO containing the headcount (pax) and transport flag.
   * @returns A Promise resolving to a quote breakdown object.
   */
  generateQuote(data: {
    pax: number;
    transport: boolean;
  }): Promise<{ quote: string; breakdown: string }>;

  /**
   * Dispatches the generation of visual collateral (like PDFs or stylized images) for a trek.
   *
   * @param data - DTO identifying the collateral type and associated trek target.
   * @returns A Promise resolving to the generated asset URL and status.
   */
  generateVisual(data: {
    type: string;
    trekName: string;
  }): Promise<{ status: string; download_url: string; message: string }>;
}
