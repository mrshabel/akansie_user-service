import { Router } from "express";
import * as controller from "../controllers/authController";

const router = Router();

router.route("/signup").post(controller.signup);
router.route("/login").post(controller.login);
router.route("/logout").get(controller.logout);

export default router;
