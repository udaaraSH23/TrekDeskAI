import { UserRepository } from "../repositories/UserRepository";
import { TourRepository } from "../repositories/TourRepository";
import { CallLogRepository } from "../repositories/CallLogRepository";
import { KnowledgeRepository } from "../repositories/KnowledgeRepository";
import { AISettingsRepository } from "../repositories/AISettingsRepository";

import { AuthService } from "../services/AuthService";
import { TourService } from "../services/TourService";
import { KnowledgeService } from "../services/KnowledgeService";
import { BookingService } from "../services/BookingService";
import { ToolDispatcher } from "../services/ToolDispatcher";

import { AuthController } from "../controllers/AuthController";
import { TourController } from "../controllers/TourController";
import { KnowledgeController } from "../controllers/KnowledgeController";
import { CallLogController } from "../controllers/CallLogController";
import { PersonaController } from "../controllers/PersonaController";

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

// ============================================
// 2. Services (Business Logic Layer)
// ============================================
export const authService = new AuthService(userRepository);
export const tourService = new TourService(tourRepository);
export const knowledgeService = new KnowledgeService(knowledgeRepository);
// Booking Service needs a tenant ID per its constructor
export const bookingService = new BookingService(MVP_TENANT_ID);

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
export const callLogController = new CallLogController(callLogRepository);
export const personaController = new PersonaController(aiSettingsRepository);
