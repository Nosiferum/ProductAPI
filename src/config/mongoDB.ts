import mongoose from "mongoose";

const connectToMongoDB = async (): Promise<void> => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/productAPI",);
        console.log(`MongoDB Connected: ${connection.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${(error as Error).message}`);
        process.exit(1);
    }
}

export default connectToMongoDB;