import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") })

type NodeEnv = 'development' | 'production' | 'test';

interface EnvConfig {
	NODE_ENV: NodeEnv;
	PORT: number;
	TURSO_DATABASE_URL: string;
	TURSO_AUTH_TOKEN: string;
	LOG_LEVEL:string;

}

const requireEnv = (key: string, defaultValue?: string): string => {
	const value = process.env[ key ] ?? defaultValue;
	if (value === undefined) {
		throw new Error(`Missing env var: ${key}`);
	}
	return value;
};

const parseIntEnv = (key: string, defaultValue?: number): number => {

	let str: string;
	if (defaultValue !== undefined) {
		str = requireEnv(key, defaultValue.toString());
	} else {
		str = requireEnv(key);
	}

	const parsed = parseInt(str, 10);
	if (isNaN(parsed)) {
		throw new Error(`Env var ${key} is not a valid number: ${str}`);
	}
	return parsed;
}

export const env:EnvConfig={
	NODE_ENV: requireEnv("NODE_ENV", "development") as NodeEnv,
	PORT: parseIntEnv("PORT", 3000),
	TURSO_DATABASE_URL: requireEnv("TURSO_DATABASE_URL"),
	TURSO_AUTH_TOKEN: requireEnv("TURSO_AUTH_TOKEN"),
	LOG_LEVEL: requireEnv("LOG_LEVEL", "info"),
}


export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';