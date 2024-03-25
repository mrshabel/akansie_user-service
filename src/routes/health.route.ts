import { Router } from "express";
import { healthCheck } from "../controllers/health-check/health";

const router = Router();

/**
 * @openapi
 * /health-check:
 *  get:
 *     tags:
 *     - Health Check
 *     description: Responds if the app is up and running
 *     responses:
 *       200:
 *         description: Service is online
 */

router.route("/health-check").get(healthCheck);

export default router;
