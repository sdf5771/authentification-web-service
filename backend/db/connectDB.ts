import mongoose from "mongoose";
import { MONGO_URI } from "../config";

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected");
        return mongoose.connection;
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
        return null;
    }
};

export default connectDB;