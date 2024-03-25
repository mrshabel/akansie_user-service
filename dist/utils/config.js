"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDb = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
async function connectDb() {
    try {
        await mongoose_1.default.connect(process.env.DATABASE_URL);
        console.log("database connection successful");
    }
    catch (error) {
        console.error("Database connection failed:\n", error);
        process.exit(1);
    }
}
exports.connectDb = connectDb;
