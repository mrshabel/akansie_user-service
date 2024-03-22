import bcrypt from "bcrypt";
import { authLoginSchema } from "../../utils/validations/auth";
import catchAsync from "../../utils/catchAsync";
import { Request, Response, NextFunction, CookieOptions } from "express";
import { AppError } from "../../utils/appError";
import User from "../../models/user.model";
import { createToken } from "../../utils/auth.utils";

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
