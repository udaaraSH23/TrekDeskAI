/**
 * @file BookingRepository.ts
 * @description PostgreSQL implementation of the booking data access layer.
 */

import { query } from "../config/database";
import { IBookingRepository } from "../interfaces/repositories/IBookingRepository";
import { BookingRow, CreateBookingPayload } from "../models/booking.schema";

/**
 * Repository handling direct PostgreSQL interactions for the bookings table.
 */
export class BookingRepository implements IBookingRepository {
  /**
   * Inserts a new booking record into the database.
   *
   * @param payload - The validated booking data from the service layer.
   * @returns A promise resolving to the fully hydrated booking row.
   */
  public async createBooking(
    payload: CreateBookingPayload,
  ): Promise<BookingRow> {
    const result = await query(
      `INSERT INTO bookings (
        tenant_id, 
        trek_id, 
        session_id, 
        customer_name, 
        customer_email, 
        customer_phone, 
        pax, 
        target_date, 
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [
        payload.tenantId,
        payload.trekId,
        payload.sessionId || null,
        payload.customerName,
        payload.customerEmail || null,
        payload.customerPhone,
        payload.pax,
        payload.targetDate,
        "pending", // Default starting state for a new reservation
      ],
    );

    return result.rows[0];
  }
}
