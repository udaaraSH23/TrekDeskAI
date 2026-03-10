/**
 * @file logger.ts
 * @description Centralized logging utility powered by Winston.
 * Configures logging levels, formats, and transports for both development and production environments.
 */

import winston from "winston";
import { env } from "../config/env";

const { combine, timestamp, printf, colorize, errors } = winston.format;

/**
 * Custom log format that outputs timestamp, level, and the message (or stack trace if available).
 */
const customFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

/**
 * Global logger instance.
 * - In production: Log level is 'info'.
 * - In development: Log level is 'debug'.
 * Includes timestamping and error stack trace support.
 */
export const logger = winston.createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }), // Automatically capture and format Error objects
    customFormat,
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(), // Add colors to console output for better visibility
        customFormat,
      ),
    }),
  ],
});

/**
 * Initialization log for development environment to confirm logger status.
 */
if (env.NODE_ENV !== "production") {
  logger.info("Winston logger initialized in development mode");
}
