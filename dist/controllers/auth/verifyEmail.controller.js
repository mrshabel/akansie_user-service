"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const appError_1 = require("../../utils/appError");
const user_model_1 = __importDefault(require("../../models/user.model"));
const auth_utils_1 = require("../../utils/auth.utils");
exports.verifyEmail = (0, catchAsync_1.default)(async (req, res, next) => {
    const token = req.params.token;
    if (!token) {
        return next(new appError_1.AppError("No token provided", 404));
    }
    // hash token and fetch user from db
    const hashedToken = (0, auth_utils_1.createHash)(req.params.token);
    const user = await user_model_1.default.findOne({
        verificationToken: hashedToken,
        verificationTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
        return next(new appError_1.AppError("The verification link is invalid or has expired", 401));
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
});
