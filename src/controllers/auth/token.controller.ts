import { CookieOptions, NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { AppError } from "../../utils/appError";
import {
    createAccessToken,
    createHash,
    verifyRefreshToken,
} from "../../utils/auth.utils";
import User from "../../models/user.model";

export const refreshToken = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        // check for token in body
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
            return next(new AppError("Refresh token is required", 404));
        }

        // verify token
        const isValidToken = verifyRefreshToken(refreshToken);
        if (!isValidToken) {
            return next(
                new AppError("Refresh token is invalid or has expired", 401)
            );
        }

        // compare to token saved in db
        const hashedRefreshToken = createHash(refreshToken);
        const user = await User.findOne({
            refreshToken: hashedRefreshToken,
            refreshTokenExpiry: { $gt: Date.now() },
        });
        if (!user) {
            return next(
                new AppError("Refresh token is invalid or has expired", 401)
            );
        }

        // create new access token
        const accessToken = createAccessToken(user._id);
        const accessTokenExpiry = parseInt(
            (process.env.ACCESS_TOKEN_EXPIRES_IN || "0h").split("")[0]
        );

        // set new access token as jwt cookie
        const cookieOptions: CookieOptions = {
            expires: new Date(Date.now() + accessTokenExpiry * 60 * 60 * 1000),
            httpOnly: true,
        };
        if (process.env.NODE_ENV === "production") {
            cookieOptions.secure = true;
        }

        // set cookie
        res.cookie("jwt", accessToken, cookieOptions);

        // send accessToken to the user
        return res.status(200).json({
            data: { accessToken },
            message: "Token refresh successful",
        });
    }
);
