import catchAsync from "../../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/appError";
import User from "../../models/user.model";
import { createHash } from "../../utils/auth.utils";

export const verifyEmail = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const token = req.params.token;
        if (!token) {
            return next(new AppError("No token provided", 404));
        }

        // hash token and fetch user from db
        const hashedToken = createHash(req.params.token);

        const user = await User.findOne({
            verificationToken: hashedToken,
            verificationTokenExpiry: { $gt: Date.now() },
        });
        if (!user) {
            return next(
                new AppError(
                    "The verification link is invalid or has expired",
                    401
                )
            );
        }
        user.isVerified = true;

        // remove token values from the database
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;

        // save modified document
        await user.save();
        return res
            .status(200)
            .json({ message: "Email verification successful" });
    }
);
