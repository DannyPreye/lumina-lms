import mongoose from 'mongoose';
import { config } from '../config/env.config';

export const connectDB = async (): Promise<void> =>
{
    try {
        const conn = await mongoose.connect(config.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error instanceof Error ? error.message : error}`);
        process.exit(1);
    }
};

mongoose.connection.on('disconnected', () =>
{
    console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) =>
{
    console.error(`❌ MongoDB error: ${err}`);
});
