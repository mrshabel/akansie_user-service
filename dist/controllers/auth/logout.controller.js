"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
exports.logout = (0, catchAsync_1.default)(async (req, res) => {
    res.cookie("jwt", "logged out", {
        expires: new Date(0),
        httpOnly: true,
    });
    return res.status(200).json({ message: "Logged out successful" });
});
