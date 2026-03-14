import { Router } from "express";
import { widgetController } from "../config/di";
import { validate } from "../middleware/validate";
import { updateWidgetSchema } from "../validators/widgetValidators";

const router = Router();

/**
 * @swagger
 * /api/v1/widget/settings:
 *   get:
 *     summary: Get widget settings for the tenant
 *     tags: [Widget]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/settings", widgetController.getSettings.bind(widgetController));

/**
 * @swagger
 * /api/v1/widget/settings:
 *   put:
 *     summary: Update widget settings
 *     tags: [Widget]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.put(
  "/settings",
  validate(updateWidgetSchema),
  widgetController.updateSettings.bind(widgetController),
);

export default router;
