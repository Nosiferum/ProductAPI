import express, { Request, Response, NextFunction } from 'express';
import logger from 'morgan';
import indexRouter from './routes';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).send('Not Found');
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500);
    res.json({ error: err.message });
});

export default app;



