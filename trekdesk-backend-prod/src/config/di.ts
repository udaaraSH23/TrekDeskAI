/**
 * @file di.ts
 * @description Dependency Injection (DI) Container for the application layer architecture.
 */
import { UserRepository } from "../repositories/UserRepository";
import { TourRepository } from "../repositories/TourRepository";
import { CallLogRepository } from "../repositories/CallLogRepository";
import { KnowledgeRepository } from "../repositories/KnowledgeRepository";
import { AISettingsRepository } from "../repositories/AISettingsRepository";
import { BookingRepository } from "../repositories/BookingRepository";

import { AuthService } from "../services/AuthService";
import { TourService } from "../services/TourService";
import { KnowledgeService } from "../services/KnowledgeService";
import { GoogleCalendarService } from "../services/GoogleCalendarService";
import { BookingService } from "../services/BookingService";
import { ToolDispatcher } from "../services/ToolDispatcher";
import { CallLogService } from "../services/CallLogService";
import { PersonaService } from "../services/PersonaService";

import { AuthController } from "../controllers/AuthController";
import { TourController } from "../controllers/TourController";
import { KnowledgeController } from "../controllers/KnowledgeController";
import { CallLogController } from "../controllers/CallLogController";
import { PersonaController } from "../controllers/PersonaController";
import { DevAuthController } from "../controllers/DevAuthController";

import { MVP_TENANT_ID } from "./constants";

/**
 * Dependency Injection (DI) Container.
 * Manages the instantiation and wire-up of the application's entire layer architecture.
 * Ensures Repositories are injected into Services, and Services into Controllers.
 */

// ============================================
// 1. Repositories (Data Access Layer)
// ============================================
export const userRepository = new UserRepository();
export const tourRepository = new TourRepository();
export const callLogRepository = new CallLogRepository();
export const knowledgeRepository = new KnowledgeRepository();
export const aiSettingsRepository = new AISettingsRepository();
export const bookingRepository = new BookingRepository();

// ============================================
// 2. Services (Business Logic Layer)
// ============================================
export const authService = new AuthService(userRepository);
export const tourService = new TourService(tourRepository);
export const knowledgeService = new KnowledgeService(knowledgeRepository);
export const googleCalendarService = new GoogleCalendarService();

// Booking Service needs a tenant ID per its constructor, plus the new repository
export const bookingService = new BookingService(
  MVP_TENANT_ID,
  bookingRepository,
  googleCalendarService,
);
export const callLogService = new CallLogService(callLogRepository);
export const personaService = new PersonaService(aiSettingsRepository);

export const toolDispatcher = new ToolDispatcher(
  bookingService,
  knowledgeService,
);

// ============================================
// 3. Controllers (Presentation/Routes Layer)
// ============================================
export const authController = new AuthController(authService);
export const tourController = new TourController(tourService);
export const knowledgeController = new KnowledgeController(knowledgeService);
export const callLogController = new CallLogController(callLogService);
export const personaController = new PersonaController(personaService);
export const devAuthController = new DevAuthController(authService);
