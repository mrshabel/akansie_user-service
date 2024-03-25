import * as z from "zod";

/**
 * @openapi
 * components:
 *   schemas:
 *     AuthSignup:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *           minLength: 8
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *
 *     AuthLoginResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         isVerified:
 *           type: boolean
 *
 *     AuthLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *           minLength: 8
 */

export const authSignupSchema = z.object({
    firstName: z.string({ required_error: "First Name is required" }),
    lastName: z.string({ required_error: "Last Name is required" }),
    email: z
        .string({ required_error: "Email is required" })
        .email({ message: "Provide a valid email" }),
    password: z
        .string({ required_error: "Password is required" })
        .min(8, { message: "Password must be 8 or more characters" }),
});

export const authLoginSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .email({ message: "Provide a valid email" }),
    password: z
        .string({ required_error: "Password is required" })
        .min(8, { message: "Password must be 8 or more characters" }),
});

export const authPasswordResetSchema = z.object({
    password: z
        .string({ required_error: "Password is required" })
        .min(8, { message: "Password must be 8 or more characters" }),
});

export const authForgotPasswordSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .email({ message: "Provide a valid email" }),
});
