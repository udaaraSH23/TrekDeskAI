/**
 * @file vite.config.ts
 * @description Vite configuration for the TrekDesk AI Admin Dashboard.
 * Includes React plugin integration and Vitest configuration for unit testing.
 */
/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/**
 * Vite & Vitest Configuration
 * @see https://vite.dev/config/
 */
export default defineConfig({
  // React plugin for Fast Refresh and JSX transformation
  plugins: [react()],

  /**
   * Vitest Configuration
   * Provides a Jest-compatible test runner for Vite.
   */
  test: {
    // Required for DOM-related tests (React components)
    environment: "jsdom",
    // Setup file for global test configurations (e.g., matchers)
    setupFiles: ["./src/setupTests.ts"],
    // Enables global 'describe', 'it', 'expect' without explicit imports
    globals: true,
  },
});
