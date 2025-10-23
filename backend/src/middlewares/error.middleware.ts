// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import logger from "@/utils/logger";
import { isDevelopment } from '@/config/env';
import { ZodError } from 'zod';
import { isAppError } from '@/utils/error.utils';
import { ResponseHandler } from '@/utils/response';

// ============================================
// TIPOS
// ============================================

import { AppError } from '@/types';


interface ErrorPayload {
	success: false;
	error: string;
	details?: unknown;
	timestamp: string;
	stack?: string;
};

interface ZodMessage {
	"expected": string,
	"code": string,
	"path": [
		string
	],
	"message": string
}

// ============================================
// FACTORY: Crear errores 
// ============================================

export const createAppError = (
	message: string,
	statusCode = 500,
	isOperational = true,
	details?: unknown
): AppError => {
	const error = new Error(message) as Error & AppError;
	error.name = 'AppError';
	error.statusCode = statusCode;
	error.isOperational = isOperational;
	error.details = details;
	Error.captureStackTrace(error, createAppError);
	return error;

};

// ============================================
// TYPE GUARDS (Funciones Puras)
// ============================================



const isZodError = (err: unknown): err is ZodError =>
	err instanceof ZodError;


// ============================================
// FUNCIONES PURAS
// ============================================

const getStatusCode = (err: unknown): number => {
	if (isAppError(err)) return err.statusCode;
	if (isZodError(err)) return 400;
	return 500;
};

const formatZodMessage = (message: ZodMessage[]): string =>
	message.map(m => `expected: ${m.expected}, code: ${m.code}, path: ${m.path.map(p => p).join("-")}, message: ${m.message}`).join('\n');

const getMessage = (err: unknown): string => {
	if (err instanceof ZodError) {

		return formatZodMessage(JSON.parse(err.message));
	};
	if (err instanceof Error) {
		return err.message;
	};
	if (typeof err === 'string') return err;

	return 'Internal Server Error';
};

const formatZodErrors = (err: ZodError) =>
	err.issues.map(issue => ({
		field: issue.path.join('.'),
		message: issue.message
	}));

const buildErrorPayload = (error: unknown): ErrorPayload => {
	const payload: ErrorPayload = {
		success: false,
		error: getMessage(error),
		timestamp: new Date().toISOString(),
	};

	if (isZodError(error)) {
		payload.details = formatZodErrors(error);
	}
	else if (isAppError(error) && error.details) {
		payload.details = error.details;
	}

	if (isDevelopment && error instanceof Error) {
		payload.stack = error.stack;
	}

	return payload;
};

const logError = (error: unknown, req: Request): void => {
	logger.error('Error Capturado por el Middleware:', {
		message: getMessage(error),
		stack: error instanceof Error ? error.stack : undefined,
		url: req.url,
		method: req.method,
		statusCode: isAppError(error) ? error.statusCode : 500,
		body: req.body,
		isOperational: isAppError(error) ? error.isOperational : false,
		details: isAppError(error) ? error.details : {}
	});
};


// ============================================
// MIDDLEWARE: Error Handler (Side Effect)
// ============================================

export const errorHandler = (
	err: unknown,
	req: Request,
	res: Response,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_next: NextFunction
): void => {
	logError(err, req);
	const statusCode = getStatusCode(err);
	const payload = buildErrorPayload(err);
	if (isDevelopment) {
		res.status(statusCode).json(payload);
		return;
	}
	ResponseHandler.error(res, getMessage(err), statusCode);
};

// ============================================
// MIDDLEWARE: Not Found
// ============================================

export const notFoundHandler = (req: Request, res: Response): void => {
	res.status(404).json({
		success: false,
		error: `Route ${req.method} ${req.originalUrl} not found`,
		timestamp: new Date().toISOString(),
	});
};

// ============================================
// WRAPPER: Async Handler (Higher Order Function)
// ============================================


type AsyncHandler = (
	req: Request,
	res: Response,
	next: NextFunction
) => Promise<Response | undefined>;

export const asyncHandler = (fn: AsyncHandler) => (
	req: Request, res: Response, next: NextFunction): void => {
	Promise.resolve(fn(req, res, next)).catch(next);
	//                                  catch(error => next(error)) 
};
