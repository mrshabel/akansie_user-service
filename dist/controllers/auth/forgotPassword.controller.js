"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPassword = void 0;
const auth_1 = require("../../utils/validations/auth");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const appError_1 = require("../../utils/appError");
const user_model_1 = __importDefault(require("../../models/user.model"));
const auth_utils_1 = require("../../utils/auth.utils");
const email_1 = require("../../services/email/email");
exports.forgotPassword = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = auth_1.authForgotPasswordSchema.safeParse(req.body);
    if (!result.success) {
        return next(new appError_1.AppError(result.error.errors[0].message, 400));
    }
    const user = await user_model_1.default.findOne({ email: result.data.email });
    if (!user) {
        return next(new appError_1.AppError("User does not exist", 401));
    }
    // create token
    const { token, hashedToken } = (0, auth_utils_1.createRandomToken)();
    const tokenExpiry = Number(process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES) ?? 10;
    user.passwordResetToken = hashedToken;
    user.passwordResetTokenExpiry = new Date(Date.now() + tokenExpiry * 1000 * 60);
    // save modified document
    await user.save();
    // send email with token
    try {
        // compose the reset url based on the user's request url
        const passwordResetURL = `${req.protocol}://${req.headers.host}/api/v1/auth/reset-password/${token}`;
        await new email_1.Email(user, passwordResetURL).sendPasswordResetEmail();
        return res.status(200).json({
            message: "Success! Proceed to reset password in your email",
        });
    }
    catch (error) {
        // revert changes if an error occurs
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpiry = undefined;
        // save modified document
        await user.save();
        console.log(error);
        return next(new appError_1.AppError("An error occurred while sending email.", 500));
    }
});
