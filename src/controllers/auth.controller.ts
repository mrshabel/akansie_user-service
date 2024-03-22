import bcrypt from "bcrypt";
import {
    authForgotPasswordSchema,
    authLoginSchema,
    authPasswordResetSchema,
    authSignupSchema,
} from "../utils/validations/auth";
import catchAsync from "../utils/catchAsync";
import { Request, Response, NextFunction, CookieOptions } from "express";
import { AppError } from "../utils/appError";
import User from "../models/user.model";
import {
    createHash,
    createRandomToken,
    createToken,
} from "../utils/auth.utils";
import { Email } from "../utils/email";

// sign up
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
            return next(new AppError("An error occurred.", 500));
        }
    }
);

// verify email
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

// login
export const login = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const result = authLoginSchema.safeParse(req.body);
        if (!result.success) {
            return next(new AppError(result.error.errors[0].message, 400));
        }
        const user = await User.findOne({
            email: result.data.email,
            isVerified: true,
        }).select("+password");
        if (
            !user ||
            !(await bcrypt.compare(result.data.password, user.password))
        ) {
            return next(new AppError("Invalid email or password", 400));
        }
        // create cookie
        const cookieOptions: CookieOptions = {
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
            httpOnly: true,
        };
        if (process.env.NODE_ENV === "production") {
            cookieOptions.secure = true;
        }

        const token = createToken(user._id);

        // set cookie
        res.cookie("jwt", token, cookieOptions);
        const userObject = user.toObject();
        const { password, ...body } = userObject;
        return res
            .status(200)
            .json({ data: { token, user: body }, message: "Login successful" });
    }
);

// logout
export const logout = catchAsync(async (req: Request, res: Response) => {
    res.cookie("jwt", "logged out", {
        expires: new Date(0),
        httpOnly: true,
    });
    return res.status(200).json({ message: "Logged out successful" });
});

// forgot password
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

// reset password
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
