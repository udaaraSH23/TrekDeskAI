/**
 * @file env.ts
 * @description Runtime environment variable validation and configuration.
 */
import { z } from "zod";
import * as dotenv from "dotenv";

// Load environment variables early in the lifecycle
dotenv.config();

/**
 * Strict runtime validation schema for process.env fields.
 * Validates the existence and correct format of all required environment variables.
 * Failure to supply critical keys (like Database URLs or API Keys) triggers an immediate `process.exit(1)`,
 * ensuring the server never starts in a compromised or misconfigured "zombie" state.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3001"),

  // Database
  DATABASE_URL: z.string().url("Must be a valid PostgreSQL connection string"),

  // Third-Party Keys
  GEMINI_API_KEY: z.string().min(1, "Gemini API Key is required"),
  GOOGLE_CLIENT_ID: z.string().min(1, "Google Client ID is required"),
  GOOGLE_CALENDAR_API_KEY: z
    .string()
    .min(1, "Google Calendar API Key is required"),

  // Security
  JWT_SECRET: z
    .string()
    .min(32, "JWT Secret must be at least 32 characters long"),
});

// Validate `process.env` against the schema
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsedEnv.error.flatten().fieldErrors,
  );
  process.exit(1);
}

// Export the strictly typed `env` object
export const env = parsedEnv.data;
