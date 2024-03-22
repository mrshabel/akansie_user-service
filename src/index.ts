import "module-alias"
import express, { Express, NextFunction, Request, Response } from "express";
import { configDotenv } from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "helmet";
import morgan from "morgan";
import globalError from "./middlewares/error.middleware";
import { AppError } from "./utils/appError";
import { connectDb } from "./utils/config";
import authRoutes from "./routes/auth.route";

// read environment variables
configDotenv({
    path: `.env.${process.env.NODE_ENV === "production" ? "prod" : "local"}`,
});
connectDb();
const port = process.env.PORT;

// instantiate server app
const app: Express = express();

// define rate limit
const limiter = rateLimit({
    max: 50,
    windowMs: 1000 * 60 * 60,
    message: "Too many requests from this IP, try again in an hour!",
});

// define middlewares
app.use(cors());
app.use(morgan("dev"));

// security middlewares
app.use(helmet()); //for https
app.use("/api", limiter); //apply limit to only api routes

// data sanitization middlewares
app.use(express.json({ limit: "10kb" }));
// sanitize against db attacks
app.use(mongoSanitize());
app.use(xss());

// route definition here
app.use("/api/v1/auth", authRoutes);
// test endpoint
app.get("/", (req, res) => {
    res.send("User Service is online");
});

// error middleware
app.use(globalError);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.listen(port, () => {
    console.log("user service started on port " + port);
});
