import * as z from "zod";

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
