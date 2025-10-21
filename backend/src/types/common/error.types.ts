// types/common/error.types.ts
export interface AppError {
	name: 'AppError';
  message: string;
  statusCode: number;
  isOperational: boolean;
  details?: unknown;
  stack?: string;
}

// Códigos de error comunes
export const ErrorCodes = {
	VALIDATION_ERROR: 'VALIDATION_ERROR',
	NOT_FOUND: 'NOT_FOUND',
	UNAUTHORIZED: 'UNAUTHORIZED',
	FORBIDDEN: 'FORBIDDEN',
	CONFLICT: 'CONFLICT',
	INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[ keyof typeof ErrorCodes ];
