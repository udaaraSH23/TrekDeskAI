/**
 * @file authRoutes.ts
 * @description Express routes for Google OAuth authentication and session verification.
 */
import { Router } from "express";
import { authController, devAuthController } from "../config/di";
import { authMiddleware } from "../middleware/authMiddleware";
import { env } from "../config/env";

const router = Router();

/**
 * @swagger
 * /api/v1/auth/dev-login:
 *   post:
 *     summary: Development-Only Authentication Bypass
 *     description: |
 *       **[DEV ONLY]** Generates a real JWT for a fixed "Dev Admin" user.
 *
 *       **Requirements for availability:**
 *       1. `NODE_ENV` must be set to `development`
 *       2. `ENABLE_DEVELOPMENT_LOGIN` must be set to `true` in .env
 *       3. Correct `secret` must be provided in request body
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - secret
 *             properties:
 *               secret:
 *                 type: string
 *                 description: The DEV_AUTH_SECRET defined in .env
 *                 example: "development_only_secret_key"
 *     responses:
 *       200:
 *         description: Login successful. Returns a real JWT.
 *       403:
 *         description: Forbidden. This endpoint is disabled on this server.
 *       401:
 *         description: Unauthorized. Incorrect dev secret.
 */
if (env.NODE_ENV === "development" && env.ENABLE_DEVELOPMENT_LOGIN) {
  router.post("/dev-login", devAuthController.devLogin.bind(devAuthController));
}

/**
 * @swagger
 * /api/v1/auth/google:
 *   post:
 *     summary: Authenticate via Google OAuth2
 *     description: Verify Google ID token, upsert user securely, and issue a backend JWT for session management.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 example: "eyJhbGciOiJSUzI1NiIsImtpZCI..."
 *     responses:
 *       200:
 *         description: Successfully authenticated. Returns user data and JWT.
 *         content:
 *           application/json:
 *             example:
 *               status: "success"
 *               message: "Login successful"
 *               data:
 *                 user:
 *                   id: "123e4567-e89b-12d3-a456-426614174000"
 *                   email: "guide@kandytreks.com"
 *                   fullName: "Jane Doe"
 *                   pictureUrl: "https://lh3.googleusercontent.com/a/..."
 *                   tenantId: "00000000-0000-0000-0000-000000000001"
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
 *       400:
 *         description: Bad Request (Missing Token)
 *         content:
 *           application/json:
 *             example:
 *               status: "error"
 *               message: "ID Token is required"
 *       401:
 *         description: Unauthorized (Email not whitelisted or token invalid)
 *         content:
 *           application/json:
 *             example:
 *               status: "error"
 *               message: "Unauthorized: Access restricted to whitelisted accounts"
 */
router.post("/google", authController.googleLogin.bind(authController));

/**
 * @swagger
 * /api/v1/auth/verify:
 *   get:
 *     summary: Verify Session JWT
 *     description: Validates the current Bearer token in the Authorization header to restore a frontend session on page reload.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid. Returns minimal user profile.
 *         content:
 *           application/json:
 *             example:
 *               status: "success"
 *               message: "Session verified"
 *               data:
 *                 user:
 *                   id: "123e4567-e89b-12d3-a456-426614174000"
 *                   email: "guide@kandytreks.com"
 *                   tenantId: "00000000-0000-0000-0000-000000000001"
 *       401:
 *         description: Unauthorized (Token expired or missing)
 *         content:
 *           application/json:
 *             example:
 *               status: "error"
 *               message: "Invalid or expired routing token"
 */
router.get(
  "/verify",
  authMiddleware,
  authController.verifySession.bind(authController),
);

export default router;
