/**
 * @file TrekDTO.ts
 * @description Data Transfer Objects for the Trek (Tour) module.
 */

import {
  CreateTrekPayload,
  UpdateTrekPayload,
  DeleteTrekPayload,
  TrekRecord,
} from "../models/trek.schema";

/**
 * DTO for creating a new trek.
 */
export type CreateTrekDTO = CreateTrekPayload;

/**
 * DTO for updating an existing trek.
 */
export type UpdateTrekDTO = UpdateTrekPayload;

/**
 * DTO for deleting a trek.
 */
export type DeleteTrekDTO = DeleteTrekPayload;

/**
 * Structure of a trek record as returned from the system.
 */
export type TrekResponseDTO = TrekRecord;
