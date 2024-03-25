import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";

export const protect = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const accessToken =
        req.cookies.jwt || req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
        return next(new AppError("No token provided", 404));
    }
};
