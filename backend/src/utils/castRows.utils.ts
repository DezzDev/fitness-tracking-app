export function castRows<T>(rows: unknown[]): T[] {
	return rows as T[];
}

export function castRow<T>(row: unknown): T {
	return row as T;
}