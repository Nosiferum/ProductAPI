import {Request, Response, NextFunction} from "express";
import {Error} from "mongoose";

type AsyncAppFunction = (req: Request, res: Response, next: NextFunction) => Promise<void>;

function wrapAsync(fn: AsyncAppFunction) {
    return function (req: Request, res: Response, next: NextFunction) {
        fn(req, res, next).catch(error => {
            if (error instanceof Error.StrictModeError) {
                return res.status(400).json({error: "Invalid fields provided. Only 'name' and 'price' are allowed."});
            }

            if (error instanceof Error.ValidationError) {
                return res.status(400).json({error: error.message});
            }
            next(error);
        });
    }
}

export default wrapAsync;