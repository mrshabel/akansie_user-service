import bcrypt from "bcrypt";
import { authPasswordResetSchema } from "../../utils/validations/auth";
import catchAsync from "../../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/appError";
import User from "../../models/user.model";
import { createHash } from "../../utils/auth.utils";

export const resetPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.params.token) {
            return next(new AppError("No token provided", 401));
        }
        //
        const result = authPasswordResetSchema.safeParse(req.body);
        if (!result.success) {
            return next(new AppError(result.error.errors[0].message, 400));
        }

        // hash token and fetch user from db
        const hashedToken = createHash(req.params.token);
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return next(
                new AppError("The reset link is invalid or has expired", 400)
            );
        }

        // hash new password
        const hashedPassword = await bcrypt.hash(result.data.password, 10);
        user.password = hashedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpiry = undefined;

        await user.save();

        return res.status(200).json({ message: "Password reset successful" });
    }
);
