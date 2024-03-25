"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appError_1 = require("../utils/appError");
// database exceptions
//handling invalid database field input
const handleCastError = (error) => {
    const message = `${error.value} is not a valid ${error.path}`;
    return new appError_1.AppError(message, 400);
};
const handleDuplicateFieldsError = (error) => {
    const value = error.message.match(/(["'])(\\?.)*?\1/)[0];
    const message = `${value} already exists`;
    return new appError_1.AppError(message, 400);
};
const handleDevelopmentError = (error, req, res) => {
    if (req.originalUrl.startsWith("/api")) {
        return res.status(error.statusCode).json({
            message: error.message,
            stack: error.stack,
            error,
        });
    }
};
const handleProductionError = (error, req, res) => {
    if (req.originalUrl.startsWith("/api")) {
        return res.status(error.statusCode).json({
            message: error.message,
        });
    }
};
const globalError = (error, // error can either be caught or uncaught
req, res, next) => {
    error.message = error.message || "Something went wrong";
    error.statusCode = error.statusCode || 500;
    // handle error in dev environment
    if (process.env.NODE_ENV === "development") {
        handleDevelopmentError(error, req, res);
    }
    // handle error in production environment
    else if (process.env.NODE_ENV === "production") {
        if (error.name === "CastError")
            error = handleCastError(error);
        if (error.code === 11000)
            error = handleDuplicateFieldsError(error);
        handleProductionError(error, req, res);
    }
};
exports.default = globalError;
