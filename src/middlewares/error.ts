const { AppError } = require("../utils/appError");
import { Request, Response, NextFunction } from "express";
import { CastError, MongooseError } from "mongoose";

// database exceptions
//handling invalid database field input
const handleCastError = (error: CastError) => {
    const message = `${error.value} is not a valid ${error.path}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsError = (error: MongooseError) => {
    const value = (error.message as any).match(/(["'])(\\?.)*?\1/)[0];
    const message = `${value} already exists`;
    return new AppError(message, 400);
};

const handleDevelopmentError = (
    error: typeof AppError,
    req: Request,
    res: Response
) => {
    if (req.originalUrl.startsWith("/api")) {
        return res.status(error.statusCode).json({
            message: error.message,
            stack: error.stack,
            error,
        });
    }
};

const handleProductionError = (
    error: typeof AppError,
    req: Request,
    res: Response
) => {
    if (req.originalUrl.startsWith("/api")) {
        return res.status(error.statusCode).json({
            message: error.message,
        });
    }
};

const globalError = (
    error: typeof AppError | Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    error.message = error.message || "Something went wrong";
    error.statusCode = error.statusCode || 500;

    if (process.env.NODE_ENV === "development") {
        handleDevelopmentError(error, req, res);
    } else if (process.env.NODE_ENV === "production") {
        if (error.name === "CastError") error = handleCastError(error);
        if (error.code === 11000) error = handleDuplicateFieldsError(error);
        handleProductionError(error, req, res);
    }
};

export default globalError;
