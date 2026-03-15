/**
 * @file BookingDTO.ts
 * @description Data Transfer Objects for the Booking module.
 */

import { CreateBookingPayload, BookingRow } from "../models/booking.schema";

/**
 * DTO for creating a new booking.
 */
export type CreateBookingDTO = CreateBookingPayload;

/**
 * Result structure for a booking as returned from the system.
 */
export type BookingResponseDTO = BookingRow & {
  trekName?: string;
};
