import { Router } from "express";
import { authController } from "../config/di";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * /api/v1/auth/google:
 *   post:
 *     summary: Authenticate via Google OAuth2
 *     description: Verify Google ID token and issue a backend JWT.
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
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *       400:
 *         description: Invalid Token
 *       401:
 *         description: Unauthorized Email
 */
router.post("/google", authController.googleLogin.bind(authController));

/**
 * @swagger
 * /api/v1/auth/verify:
 *   get:
 *     summary: Verify Session JWT
 *     description: Validate the current Bearer token.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/verify",
  authMiddleware,
  authController.verifySession.bind(authController),
);

export default router;
