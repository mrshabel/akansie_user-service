"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_1 = require("../../utils/validations/auth");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const appError_1 = require("../../utils/appError");
const user_model_1 = __importDefault(require("../../models/user.model"));
const auth_utils_1 = require("../../utils/auth.utils");
exports.resetPassword = (0, catchAsync_1.default)(async (req, res, next) => {
    if (!req.params.token) {
        return next(new appError_1.AppError("No token provided", 401));
    }
    //
    const result = auth_1.authPasswordResetSchema.safeParse(req.body);
    if (!result.success) {
        return next(new appError_1.AppError(result.error.errors[0].message, 400));
    }
    // hash token and fetch user from db
    const hashedToken = (0, auth_utils_1.createHash)(req.params.token);
    const user = await user_model_1.default.findOne({
        passwordResetToken: hashedToken,
        passwordResetTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
        return next(new appError_1.AppError("The reset link is invalid or has expired", 400));
    }
    // hash new password
    const hashedPassword = await bcrypt_1.default.hash(result.data.password, 10);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;
    await user.save();
    return res.status(200).json({ message: "Password reset successful" });
});
