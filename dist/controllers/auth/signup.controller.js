"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_1 = require("../../utils/validations/auth");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const appError_1 = require("../../utils/appError");
const user_model_1 = __importDefault(require("../../models/user.model"));
const auth_utils_1 = require("../../utils/auth.utils");
const email_1 = require("../../services/email/email");
exports.signup = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = auth_1.authSignupSchema.safeParse(req.body);
    if (!result.success) {
        return next(new appError_1.AppError(result.error.errors[0].message, 400));
    }
    const hashedPassword = await bcrypt_1.default.hash(result.data.password, 10);
    const user = await user_model_1.default.create({
        ...result.data,
        password: hashedPassword,
    });
    const { token, hashedToken } = (0, auth_utils_1.createRandomToken)();
    const tokenExpiry = Number(process.env.VERIFICATION_TOKEN_EXPIRES_IN_HOURS) ?? 1;
    user.verificationToken = hashedToken;
    user.verificationTokenExpiry = new Date(Date.now() + tokenExpiry * 1000 * 60 * 60);
    // save modified document
    await user.save();
    //TODO: send email when user is created
    try {
        // compose the verification url based on the user's request url
        const verificationURL = `${req.protocol}://${req.headers.host}/api/v1/auth/verify-email/${token}`;
        await new email_1.Email(user, verificationURL).sendAccountVerificationEmail();
        const userObject = user.toObject();
        const { password, ...body } = userObject;
        res.status(201).json({
            message: "Success! A verification link has been sent to your email",
        });
    }
    catch (error) {
        // revert changes if an error occurs
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
        // save modified document
        await user.save();
        console.log(error);
        return next(new appError_1.AppError("An error occurred.", 500));
    }
});
