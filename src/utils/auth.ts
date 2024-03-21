import jwt from "jsonwebtoken";
import { Types } from "mongoose";

export const createToken = (id: Types.ObjectId) => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_SECRET as string);
};
