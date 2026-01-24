import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('5000'),
    NODE_ENV: z.enum([ 'development', 'production', 'test' ]).default('development'),
    MONGODB_URI: z.string(),
    JWT_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),
    ACCESS_TOKEN_EXPIRE: z.string().default('15m'),
    REFRESH_TOKEN_EXPIRE: z.string().default('7d'),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_CALLBACK_URL: z.string().default('http://localhost:5000/api/v1/auth/google/callback'),
    NEO4J_URI: z.string().optional(),
    NEO4J_USERNAME: z.string().optional(),
    NEO4J_PASSWORD: z.string().optional(),
});

const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
    console.error('❌ Invalid environment variables:', envVars.error.format());
    process.exit(1);
}

export const config = envVars.data;
