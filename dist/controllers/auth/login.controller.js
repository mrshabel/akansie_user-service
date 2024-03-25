"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_1 = require("../../utils/validations/auth");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const appError_1 = require("../../utils/appError");
const user_model_1 = __importDefault(require("../../models/user.model"));
const auth_utils_1 = require("../../utils/auth.utils");
exports.login = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = auth_1.authLoginSchema.safeParse(req.body);
    if (!result.success) {
        return next(new appError_1.AppError(result.error.errors[0].message, 400));
    }
    const user = await user_model_1.default.findOne({
        email: result.data.email,
        isVerified: true,
    }).select("+password");
    if (!user ||
        !(await bcrypt_1.default.compare(result.data.password, user.password))) {
        return next(new appError_1.AppError("Invalid email or password", 400));
    }
    // create cookie
    const cookieOptions = {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === "production") {
        cookieOptions.secure = true;
    }
    const token = (0, auth_utils_1.createToken)(user._id);
    // set cookie
    res.cookie("jwt", token, cookieOptions);
    const userObject = user.toObject();
    const { password, ...body } = userObject;
    return res
        .status(200)
        .json({ data: { token, user: body }, message: "Login successful" });
});
