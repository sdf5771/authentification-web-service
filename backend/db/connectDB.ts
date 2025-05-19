import mongoose from "mongoose";
import chalk from "chalk";
import { MONGO_URI } from "../config";

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log(chalk.blue('[MongoDB]:'), chalk.green('MongoDB 데이터베이스 연결 성공'));
        return mongoose.connection;
    } catch (error) {
        console.error(chalk.red('[MongoDB]:'), chalk.red('MongoDB 데이터베이스 연결 실패'), error);
        process.exit(1);
    }
};

export default connectDB;