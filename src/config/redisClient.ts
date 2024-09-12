import { createClient } from "redis";

const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redisClient.on("error", (err) => console.error('Redis client error', err));

const maxRetries = 5;
const retryInterval = 5000;
let retries = 0;

const connectToRedis = async () => {
    if (!redisClient.isOpen) {
        try {
            await redisClient.connect();
            console.log(`Connected to Redis: ${redisClient.options?.url}`);
        } catch (err) {
            while (retries < maxRetries) {
                retries++;
                console.error('Cannot Connect to Redis on App start', err);

                console.log(`Retrying to connect... (${retries}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, retryInterval));
            }
        }
    }
}

export { redisClient, connectToRedis };