import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

if(!process.env.TURSO_DATABASE_URL) {
	throw new Error("TURSO_DATABASE_URL is not defined in environment variables");
}

if(!process.env.TURSO_AUTH_TOKEN) {
	throw new Error("TURSO_AUTH_TOKEN is not defined in environment variables");
}

export const turso = createClient({
	url: process.env.TURSO_DATABASE_URL,
	authToken: process.env.TURSO_AUTH_TOKEN,
})
