import { Router } from "express";
import * as controller from "../controllers/auth.controller";

const router = Router();

router.route("/signup").post(controller.signup);
router.route("/verify-email/:token").get(controller.verifyEmail);
router.route("/login").post(controller.login);
router.route("/logout").get(controller.logout);
router.route("/forgot-password").post(controller.forgotPassword);
router.route("/reset-password/:token").patch(controller.resetPassword);

export default router;
