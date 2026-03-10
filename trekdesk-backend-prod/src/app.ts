/**
 * TrekDesk AI - Express Application Configuration
 *
 * This module configures the Express application, including middleware,
 * security headers, logging, and route registration. It serves as the
 * core REST API controller for the Admin Dashboard and Management tools.
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { logger } from "./utils/logger";

/**
 * Route Imports
 * Domain-specific routers for handling various API resources.
 */
import authRoutes from "./routes/authRoutes";
import personaRoutes from "./routes/personaRoutes";
import callLogRoutes from "./routes/callLogRoutes";
import tourRoutes from "./routes/tourRoutes";
import knowledgeRoutes from "./routes/knowledgeRoutes";

/**
 * Middleware Imports
 * Centralized error handling and session security logic.
 */
import { errorHandler } from "./middleware/errorHandler";
import { authMiddleware } from "./middleware/authMiddleware";

// Initialize the Express application instance
const app = express();

/**
 * Global Middleware Stack
 */
// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet());

// Morgan provides automated HTTP request logging for development/monitoring
// Stream morgan logs to winston
app.use(
  morgan(env.NODE_ENV === "production" ? "combined" : "dev", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

// CORS middleware allows for Cross-Origin Resource Sharing with the Admin Dashboard
app.use(cors());

// Parse incoming JSON payloads automatically
app.use(express.json());

/**
 * API Route Registration
 */

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

/**
 * Swagger Interactive API Documentation
 */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * Rate Limiting configuration
 * Protects APIs against brute-force and DDoS attacks
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login requests per hour
  message: "Too many login attempts, please try again after an hour",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Public Routes
 * Accessible without authentication (e.g., Google OAuth login)
 */
app.use("/api/v1/auth", authLimiter, authRoutes);

/**
 * Protected Management Routes
 * All routes below require a valid JWT issued during the login process.
 * The authMiddleware verifies tokens before passing control to the routers.
 */
app.use("/api/v1/persona", authMiddleware, personaRoutes);
app.use("/api/v1/analytics/calls", authMiddleware, callLogRoutes);
app.use("/api/v1/tours", authMiddleware, tourRoutes);
app.use("/api/v1/knowledge", authMiddleware, knowledgeRoutes);

/**
 * Health Check Endpoint
 * Used by load balancers and container orchestrators (e.g., Google Cloud Run)
 * to verify that the service is healthy and responding to traffic.
 */
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "healthy", timestamp: new Date().toISOString() });
});

/**
 * Centralized Error Handling Middleware
 * MUST be registered after all routes to catch exceptions thrown
 * during request processing.
 */
app.use(errorHandler);

// Export the configured app instance
export default app;
