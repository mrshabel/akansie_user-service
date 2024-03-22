import catchAsync from "../../utils/catchAsync";
import { Request, Response } from "express";

export const logout = catchAsync(async (req: Request, res: Response) => {
    res.cookie("jwt", "logged out", {
        expires: new Date(0),
        httpOnly: true,
    });
    return res.status(200).json({ message: "Logged out successful" });
});
