import { Request, Response, NextFunction } from "express";
const catchAsync = (
    fn: (
        req: Request,
        res: Response,
        next: NextFunction
    ) => Promise<void | Response<string, any>>
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};

export default catchAsync;
