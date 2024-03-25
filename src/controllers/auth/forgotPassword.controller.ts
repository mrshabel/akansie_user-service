import { authForgotPasswordSchema } from "../../schemas/auth.schema";
import catchAsync from "../../utils/catchAsync";
import { Request, Response, NextFunction, CookieOptions } from "express";
import { AppError } from "../../utils/appError";
import User from "../../models/user.model";
import { createRandomToken } from "../../utils/auth.utils";
import { Email } from "../../services/email/email";

export const forgotPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const result = authForgotPasswordSchema.safeParse(req.body);
        if (!result.success) {
            return next(new AppError(result.error.errors[0].message, 400));
        }
        const user = await User.findOne({ email: result.data.email });
        if (!user) {
            return next(new AppError("User does not exist", 401));
        }
        // create token
        const { token, hashedToken } = createRandomToken();
        const tokenExpiry =
            Number(process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES) ?? 10;
        user.passwordResetToken = hashedToken;
        user.passwordResetTokenExpiry = new Date(
            Date.now() + tokenExpiry * 1000 * 60
        );

        // save modified document
        await user.save();

        // send email with token
        try {
            // compose the reset url based on the user's request url
            const passwordResetURL = `${req.protocol}://${req.headers.host}/api/v1/auth/reset-password/${token}`;
            await new Email(user, passwordResetURL).sendPasswordResetEmail();
            return res.status(200).json({
                message: "Success! Proceed to reset password in your email",
            });
        } catch (error) {
            // revert changes if an error occurs
            user.passwordResetToken = undefined;
            user.passwordResetTokenExpiry = undefined;

            // save modified document
            await user.save();
            console.log(error);
            return next(
                new AppError("An error occurred while sending email.", 500)
            );
        }
    }
);
