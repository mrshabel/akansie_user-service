import { Router } from "express";
import * as controller from "../controllers/auth/index";
const router = Router();

/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: Endpoints for user authentication
 * /signup:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#components/schemas/AuthSignup'
 *     responses:
 *       '200':
 *         description: User registered successfully
 *       '400':
 *         description: Bad request. Check your request parameters.
 *       '500':
 *         description: Internal server error. Please try again later.
 */

/**
 * @openapi
 * /verify-email/{token}:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Verify Email
 *     description: Verifies user's email with the provided token.
 *     parameters:
 *       - in: path
 *         name: token
 *         description: Verification token received via email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Email verified successfully
 *       '400':
 *         description: Bad request. Check your request parameters.
 *       '500':
 *         description: Internal server error. Please try again later.
 */

/**
 * @openapi
 * /login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: User Login
 *     description: Logs in a user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#components/schemas/AuthLogin'
 *     responses:
 *       '200':
 *         description: Login successful
 *       '400':
 *         description: Bad request. Check your request parameters.
 *       '500':
 *         description: Internal server error. Please try again later.
 */

/**
 * @openapi
 * /logout:
 *   get:
 *     tags:
 *       - Auth
 *     summary: User Logout
 *     description: Logs out a user.
 *     responses:
 *       '200':
 *         description: Logout successful
 *       '500':
 *         description: Internal server error. Please try again later.
 */

/**
 * @openapi
 * /forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Forgot Password
 *     description: Sends a password reset link to the user's email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Password reset email sent successfully
 *       '400':
 *         description: Bad request. Check your request parameters.
 *       '500':
 *         description: Internal server error. Please try again later.
 */

/**
 * @openapi
 * /reset-password/{token}:
 *   patch:
 *     tags:
 *       - Auth
 *     summary: Reset Password
 *     description: Resets user's password with the provided token.
 *     parameters:
 *       - in: path
 *         name: token
 *         description: Reset password token received via email
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Password reset successful
 *       '400':
 *         description: Bad request. Check your request parameters.
 *       '500':
 *         description: Internal server error. Please try again later.
 */

/**
 * @openapi
 * /token:
 *   post:
 *     tags:
 *       - Auth
 *     security:
 *       - BearerAuth: []
 *     summary: Refresh Token
 *     description: Refreshes the authentication token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Token refreshed successfully
 *       '400':
 *         description: Bad request. Check your request parameters.
 *       '500':
 *         description: Internal server error. Please try again later.
 */

router.route("/signup").post(controller.signup);
router.route("/verify-email/:token").get(controller.verifyEmail);
router.route("/login").post(controller.login);
router.route("/logout").get(controller.logout);
router.route("/forgot-password").post(controller.forgotPassword);
router.route("/reset-password/:token").patch(controller.resetPassword);
router.route("/token").post(controller.refreshToken);

export default router;
