// src/config/env.ts
import dotenv from "dotenv";
import path from "path";
import z from "zod";
import logger from "@/utils/logger";
import { LogLevel, NodeEnv } from "@/types";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

interface EnvConfig {
	NODE_ENV: NodeEnv;
	PORT: number;
	TURSO_DATABASE_URL: string;
	TURSO_AUTH_TOKEN: string;
	LOG_LEVEL: string;
	JWT_ACCESS_SECRET:string;
	JWT_REFRESH_SECRET:string;
	JWT_ACCESS_EXPIRY:string;
	JWT_REFRESH_EXPIRY:string;
  COOKIE_SECURE: boolean;
  COOKIE_DOMAIN: string;
}

const EnvSchema = z.object({
	NODE_ENV: z.enum(NodeEnv).default(NodeEnv.Development),
	PORT: z.string().transform(Number).pipe(z.number().int().min(1).max(65535)).default(3000),
	TURSO_DATABASE_URL: z.url('Invalid database URL format'),
	TURSO_AUTH_TOKEN: z.string().min(1, 'TURSO_AUTH_TOKEN is required'),
	LOG_LEVEL: z.enum(LogLevel).default(LogLevel.Info),
	JWT_ACCESS_SECRET: z.string({ error: "Invalid jwt secret" }),
	JWT_REFRESH_SECRET: z.string({ error: "Invalid jwt secret" }),
	JWT_ACCESS_EXPIRY: z.string({ error: "Invalid jwt expiry" }),
	JWT_REFRESH_EXPIRY: z.string({ error: "Invalid jwt expiry" }),
  COOKIE_SECURE: z.string().transform((v) => v === 'true').default(false),
  COOKIE_DOMAIN: z.string().default('localhost')
});

// ============================================
// VALIDACIÓN Y EXPORTACIÓN
// ============================================

function validateEnv() {
	try {
		return EnvSchema.parse(process.env);
	} catch (error) {
		if (error instanceof z.ZodError) {
			logger.error("❌ Invalid environment variables:");
			error.issues.forEach(issue => {
				logger.error(` - ${issue.path.join('.')}: ${issue.message}`);
			});
			process.exit(1);
		}
    logger.error("Unexpected error during environment validation:", error);
		throw error;
	}
}

export const env: EnvConfig = validateEnv();
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

// Type-safe export
// export type Env = z.infer<typeof EnvSchema>;