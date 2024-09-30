import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(() => {
    jest.clearAllMocks();
});

afterEach(async () => {
    if (mongoose.connection.readyState === 1) {
        const collections = await mongoose.connection.db?.collections();
        if (collections) {
            for (let collection of collections) {
                await collection.deleteMany({});
            }
        }
    } else {
        throw new Error("Mongoose is not connected.");
    }
});


jest.mock('../../src/config/redisClient', () => ({
    redisClient: {
        get: jest.fn(),
        setEx: jest.fn(),
        del: jest.fn(),
    },
}));
