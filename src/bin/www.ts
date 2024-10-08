#!/usr/bin/env node

import app from '../app';
import * as http from 'http';
import debugLib from 'debug';
import dotenv from 'dotenv';
import connectToMongoDB from "../config/mongoDB";
import {connectToRedis} from "../config/redisClient";

dotenv.config();

const debug = debugLib('product-api:server');

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

connectToMongoDB();
connectToRedis();

const server = http.createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val: string): string | number | false {
    const port = parseInt(val, 10);
    if (isNaN(port)) return val;
    if (port >= 0) return port;
    return false;
}

function onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') throw error;

    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening(): void {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr?.port;
    debug('Listening on ' + bind);
}
