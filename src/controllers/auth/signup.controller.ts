import bcrypt from "bcrypt";
import { authSignupSchema } from "../../schemas/auth.schema";
import catchAsync from "../../utils/catchAsync";
import { Request, Response, NextFunction, CookieOptions } from "express";
import { AppError } from "../../utils/appError";
import User from "../../models/user.model";
import { createRandomToken } from "../../utils/auth.utils";
import { Email } from "../../services/email/email";

export const signup = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const result = authSignupSchema.safeParse(req.body);
        if (!result.success) {
            return next(new AppError(result.error.errors[0].message, 400));
        }
        const hashedPassword = await bcrypt.hash(result.data.password, 10);
        const user = await User.create({
            ...result.data,
            password: hashedPassword,
        });
        const { token, hashedToken } = createRandomToken();
        const tokenExpiry =
            Number(process.env.VERIFICATION_TOKEN_EXPIRES_IN_HOURS) ?? 1;
        user.verificationToken = hashedToken;
        user.verificationTokenExpiry = new Date(
            Date.now() + tokenExpiry * 1000 * 60 * 60
        );

        // save modified document
        await user.save();
        //TODO: send email when user is created
        try {
            // compose the verification url based on the user's request url
            const verificationURL = `${req.protocol}://${req.headers.host}/api/v1/auth/verify-email/${token}`;
            await new Email(
                user,
                verificationURL
            ).sendAccountVerificationEmail();
            const userObject = user.toObject();
            const { password, ...body } = userObject;
            res.status(201).json({
                message:
                    "Success! A verification link has been sent to your email",
            });
        } catch (error) {
            // revert changes if an error occurs
            user.verificationToken = undefined;
            user.verificationTokenExpiry = undefined;

            // save modified document
            await user.save();
            console.log(error);
            return next(new AppError("Something went wromg", 500));
        }
    }
);
