import {Request, Response, NextFunction} from "express";

type AsyncAppFunction = (req: Request, res: Response, next: NextFunction) => Promise<void>;

function wrapAsync(fn: AsyncAppFunction) {
    return function (req: Request, res: Response, next: NextFunction) {
        fn(req, res, next).catch(e => next(e));
    }
}

export default wrapAsync;