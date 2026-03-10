import { Router } from "express";
import { personaController } from "../config/di";
import { validate } from "../middleware/validate";
import { updatePersonaSchema } from "../validators/personaValidators";

const router = Router();

/**
 * @swagger
 * /api/v1/persona/settings:
 *   get:
 *     summary: Get AI persona settings for the tenant
 *     tags: [AI Persona]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns persona settings like voice and prompt instructions
 */
router.get("/settings", personaController.getSettings.bind(personaController));

/**
 * @swagger
 * /api/v1/persona/settings:
 *   put:
 *     summary: Update AI persona settings
 *     tags: [AI Persona]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               voice_name:
 *                 type: string
 *               system_instruction:
 *                 type: string
 *     responses:
 *       200:
 *         description: Persona settings updated successfully
 */
router.put(
  "/settings",
  validate(updatePersonaSchema),
  personaController.updateSettings.bind(personaController),
);

export default router;
