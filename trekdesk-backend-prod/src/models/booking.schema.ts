/**
 * @file booking.schema.ts
 * @description Zod validation schemas and TypeScript DTOs for the Booking domain.
 * Ensures strict type safety when creating or retrieving bookings from the AI.
 */
import { z } from "zod";

/**
 * Validates the core structure of a Booking matching the database schema.
 */
export const BookingSchema = z.object({
  id: z.string().uuid("Invalid Booking ID format"),
  tenant_id: z.string().uuid("Invalid Tenant ID"),
  trek_id: z.string().uuid("Invalid Trek ID"),
  session_id: z.string().optional().nullable(),
  customer_name: z.string().min(1, "Customer name is required"),
  customer_email: z.string().email("Invalid email").optional().nullable(),
  customer_phone: z.string().min(5, "Customer phone number is required"),
  pax: z.number().int().positive("Participants must be at least 1"),
  target_date: z.date(),
  status: z.enum(["pending", "payment_required", "confirmed", "cancelled"]),
  created_at: z.date(),
  updated_at: z.date(),
});

export type BookingRow = z.infer<typeof BookingSchema>;

/**
 * DTO Payload required to create a new booking.
 * This is exactly what the AI Tool Dispatcher will provide.
 */
export const CreateBookingPayloadSchema = z.object({
  tenantId: z.string().uuid("Tenant ID is required for multi-tenancy bounds"),
  trekId: z.string().uuid("Trek ID is required to link the booking"),
  sessionId: z.string().optional(),
  customerName: z
    .string()
    .min(2, "Customer name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email format").optional(),
  customerPhone: z.string().min(8, "Valid phone/WhatsApp number is required"), // Strict requirement for MVP
  pax: z.number().int().min(1, "Must book for at least 1 person"),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

export type CreateBookingPayload = z.infer<typeof CreateBookingPayloadSchema>;
