/**
 * @file IBookingRepository.ts
 * @description Interface definition for the Booking data access layer.
 */

import { CreateBookingDTO, BookingResponseDTO } from "../../dtos/BookingDTO";

/**
 * Defines the contract for persisting and retrieving tour bookings.
 * Abstracts the underlying database so business logic remains agnostic.
 */
export interface IBookingRepository {
  /**
   * Persists a newly created booking into the database.
   *
   * @param payload - Structured and validated DTO containing the user's details and target trek.
   * @returns A promise resolving to the fully instantiated database row representing the booking.
   */
  createBooking(payload: CreateBookingDTO): Promise<BookingResponseDTO>;
}
