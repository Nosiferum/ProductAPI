import mongoose from "mongoose";

const connectToMongoDB = async (): Promise<void> => {
    const maxRetries = 5;
    const retryInterval = 5000;
    let retries = 0;

    try {
        const connection = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/productAPI",);

        console.log(`MongoDB Connected: ${connection.connection.host}:${connection.connection.port}`);
    } catch (error) {
        while (retries < maxRetries) {
            retries++;
            console.error(`MongoDB Connection Error: ${(error as Error).message}`);

            console.log(`Retrying to connect... (${retries}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, retryInterval));
        }
    }
}

export default connectToMongoDB;