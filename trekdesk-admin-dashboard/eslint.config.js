/**
 * @file eslint.config.js
 * @description Modern ESLint flat configuration for the TrekDesk AI project.
 * Enforces code quality, React hooks best practices, and TypeScript safety.
 */
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

/**
 * ESLint Configuration Definition
 * Uses the new Flat Config system (v9+).
 */
export default defineConfig([
  // Global excludes - avoid linting build artifacts or vendor code
  globalIgnores(["dist"]),

  {
    // Apply these rules to all TypeScript and TSX modules
    files: ["**/*.{ts,tsx}"],

    /**
     * Preset Configurations:
     * - js/recommended: Standard JS best practices
     * - tseslint/recommended: Strong type-safety and TS-specific patterns
     * - reactHooks/flat/recommended: Ensures logical hook ordering and dependency arrays
     * - reactRefresh/vite: Enables HMR safety checks for Vite
     */
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    languageOptions: {
      // Modern JS syntax support
      ecmaVersion: 2020,
      // Provide browser globals like 'window' or 'document' to avoid 'undefined' errors
      globals: globals.browser,
    },

    /**
     * Custom Rule Overrides
     * Can be expanded here to enforce project-specific styles.
     */
    rules: {
      // Add custom rule overrides here
    },
  },
]);
