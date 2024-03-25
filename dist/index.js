"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const helmet_2 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const appError_1 = require("./utils/appError");
const config_1 = require("./utils/config");
const auth_route_1 = __importDefault(require("./routes/auth.route"));
// read environment variables
(0, dotenv_1.configDotenv)({
    path: `.env.${process.env.NODE_ENV === "production" ? "prod" : "local"}`,
});
(0, config_1.connectDb)();
const port = process.env.PORT;
// instantiate server app
const app = (0, express_1.default)();
// define rate limit
const limiter = (0, express_rate_limit_1.default)({
    max: 50,
    windowMs: 1000 * 60 * 60,
    message: "Too many requests from this IP, try again in an hour!",
});
// define middlewares
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
// security middlewares
app.use((0, helmet_1.default)()); //for https
app.use("/api", limiter); //apply limit to only api routes
// data sanitization middlewares
app.use(express_1.default.json({ limit: "10kb" }));
// sanitize against db attacks
app.use((0, express_mongo_sanitize_1.default)());
app.use((0, helmet_2.default)());
// route definition here
app.use("/api/v1/auth", auth_route_1.default);
// test endpoint
app.get("/", (req, res) => {
    res.send("User Service is online");
});
// error middleware
app.use(error_middleware_1.default);
app.all("*", (req, res, next) => {
    next(new appError_1.AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.listen(port, () => {
    console.log("user service started on port " + port);
});
