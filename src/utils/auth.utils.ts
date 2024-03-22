import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import crypto from "crypto";

export const createToken = (id: Types.ObjectId) => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};
export const verifyToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_SECRET as string);
};
export const createAccessToken = (id: Types.ObjectId) => {
    // TODO: add user permissions
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET as string, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    });
};

export const createRefreshToken = (id: Types.ObjectId) => {
    return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET as string, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    });
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string);
};

export const createHash = (payload: any) => {
    // hash with a key
    return crypto
        .createHmac("sha256", process.env.HASH_SECRET as string)
        .update(payload)
        .digest("hex");
};

export const createRandomToken = () => {
    // create a token buffer then convert to string
    const token = crypto.randomBytes(32).toString("hex");
    // hash the token then persist into database
    const hashedToken = createHash(token);

    return { token, hashedToken };
};
