import bcrypt from "bcrypt";
import { authLoginSchema } from "../../schemas/auth.schema";
import catchAsync from "../../utils/catchAsync";
import { Request, Response, NextFunction, CookieOptions } from "express";
import { AppError } from "../../utils/appError";
import User from "../../models/user.model";
import {
    createAccessToken,
    createHash,
    createRefreshToken,
} from "../../utils/auth.utils";

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
        // remove password from response body
        const { password, ...body } = user.toObject();

        // send both access and refresh token to user then validate on request
        const accessToken = createAccessToken(user._id);
        const refreshToken = createRefreshToken(user._id);

        // hash refresh token and save to database
        const hashedRefreshToken = createHash(refreshToken);

        const refreshTokenExpiry = parseInt(
            (process.env.REFRESH_TOKEN_EXPIRES_IN || "1d").split("")[0]
        );
        user.refreshToken = hashedRefreshToken;
        user.refreshTokenExpiry = new Date(
            Date.now() + refreshTokenExpiry * 24 * 60 * 60 * 1000
        );

        await user.save();

        // create cookie
        const accessTokenExpiry = parseInt(
            (process.env.ACCESS_TOKEN_EXPIRES_IN || "0h").split("")[0]
        );
        const cookieOptions: CookieOptions = {
            expires: new Date(Date.now() + accessTokenExpiry * 60 * 60 * 1000),
            httpOnly: true,
        };
        if (process.env.NODE_ENV === "production") {
            cookieOptions.secure = true;
        }

        // set cookie
        res.cookie("jwt", accessToken, cookieOptions);
        return res.status(200).json({
            data: { accessToken, refreshToken, user: body },
            message: "Login successful",
        });
    }
);
