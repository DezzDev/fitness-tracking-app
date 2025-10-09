// ============================================
// src/types/database.types.ts
// ============================================
import { ResultSet } from '@libsql/client';

export type QueryResult<T = unknown> = ResultSet & {
	rows: T[];
};

export type TransactionFn<T> = () => Promise<T>;

export interface DatabaseConfig {
	url: string;
	authToken: string;
	maxRetries?: number;
	retryDelay?: number;
};