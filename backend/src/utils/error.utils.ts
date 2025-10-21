// src/utils/error.utils.ts

import { AppError } from "@/types";
import { createAppError } from "@/middlewares/error.middleware";
import logger from "./logger";

// ============================================
// TYPE GUARDS
// ============================================

export const isAppError = (err: unknown): err is AppError => (
	typeof err === 'object' &&
	err !== null &&
	'name' in err &&
	err.name === 'AppError'
);

export const isError = (err: unknown): err is Error =>
	err instanceof Error;

// ============================================
// ERROR ANALYSIS
// ============================================

interface ErrorAnalysis {
	statusCode: number;
	isOperational: boolean;
	category: 'timeout' | 'connection' | 'database' | 'unknown';
}

export const analyzeError = (err: Error): ErrorAnalysis => {
	const errorMsg = err.message.toLowerCase();

	// Timeout Errors
	if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
		return {
			statusCode: 504,
			isOperational: false,
			category: 'timeout'
		};
	}

	// Connection errors
	if (
		errorMsg.includes('econnrefused') ||
		errorMsg.includes('connection refused') ||
		errorMsg.includes('connection lost')
	) {
		return {
			statusCode: 503,
			isOperational: false,
			category: 'connection'
		};
	}

	// Database errors
	if (
		errorMsg.includes('database') ||
		errorMsg.includes('sql') ||
		errorMsg.includes('sqlite')
	) {
		return {
			statusCode: 503,
			isOperational: false,
			category: 'database'
		};
	}

	// unknown errors
	return {
		statusCode: 500,
		isOperational: false,
		category: 'unknown'
	};
};

// ============================================
// ERROR HANDLERS
// ============================================
// ✅ Usa try/catch + handleServiceError Cuando:
// El método tiene lógica de negocio compleja

export const handleServiceError = (
	error: unknown,
	context: string,
	userMessage: string,
	metadata?: Record<string, unknown>
): never => {

	// si es AppError, propagar sin modificar
	if (isAppError(error)) {
		logger.error(`[${context}] AppError propagated: `, {
			message: error.message,
			stack: error.stack,
			statusCode: error.statusCode,
			...metadata
		});
		throw error;
	};

	// si es Error, analizar y crear AppError
	if (isError(error)) {
		const analysis = analyzeError(error);

		logger.error(`[${context}] ${analysis.category} error: `, {
			message: error.message,
			stack: error.stack,
			statusCode: analysis.statusCode,
			...metadata
		});

		throw createAppError(
			userMessage,
			analysis.statusCode,
			analysis.isOperational
		);
	}

	// Error desconocido
	logger.error(`[${context}] Unexpected error: `, { error, ...metadata });
	throw createAppError('An unexpected error occurred', 500, false);
};

// ============================================
// ASYNC WRAPPER
// ============================================
// ✅ Usa wrapServiceCall Cuando:
// El método es simple y solo hace llamadas al repository

// export const wrapServiceCall = async <T>(
// 	operation: () => Promise<T>,
// 	context: string,
// 	errorMessage: string,
// 	metadata?: Record<string, unknown>
// ): Promise<T> => {
// 	try {
// 		return await operation();
// 	} catch (error) {
// 		// Manejar el error usando el manejador centralizado
// 		throw handleServiceError(error, context, errorMessage, metadata);

// 	};
// };