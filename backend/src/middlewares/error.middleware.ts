import {Request, Response} from 'express';
import logger from "@/utils/logger";
import { isDevelopment } from '@/config/env';

// ============================================
// TIPOS
// ============================================

export interface AppError extends Error {
	statusCode: number;
	isOperational: boolean;
}

interface ErrorPayload {
  success: boolean;
  error: string;
  timestamp: string;
  stack?: string;
}

interface NotFoundPayload {
  success: boolean;
  error: string;
  timestamp: string;
}

// ============================================
// FACTORY FUNCTIONS (reemplazo de clases)
// ============================================

export const createAppError = (message: string, statusCode: 500, isOperational = true): AppError => {
	const error = new Error(message) as AppError;
	error.statusCode = statusCode;
	error.isOperational = isOperational;
	Error.captureStackTrace(error, createAppError);
	return error;	
}

// ============================================
// FUNCIONES PURAS
// ============================================

const isAppError = (err: Error): err is AppError =>
	'statusCode' in err && 'isOperational' in err;

const getStatusCode = (err:Error |AppError):number =>
	isAppError(err) ? err.statusCode : 500;

const getMessage = (err:Error):string =>
	err.message || 'Internal Server Error';

const createErrorPayload = (err:Error): ErrorPayload => ({
	success: false,
	error: getMessage(err),
	timestamp: new Date().toISOString(),
	...(isDevelopment && { stack: err.stack }),
})

const createNotFoundPayload = (method:string, url:string):NotFoundPayload =>({
	success:false,
	error: `Route ${method} ${url} not found`,
	timestamp: new Date().toISOString(),
})

const logError = (err:Error, req:Request):void =>{
	logger.error('Error capturado', {
		message: err.message,
		stack: err.stack,
		url: req.url,
		method: req.method,
	})
}

// ============================================
// HANDLERS (Side Effects)
// ============================================

export const errorHandler = (
	err: Error | AppError,
	req: Request,
	res: Response
	//,next: NextFunction
): void => {
	logError(err, req);
	const statusCode = getStatusCode(err);
	const payload = createErrorPayload(err);
	res.status(statusCode).json(payload);
}

export const notFoundHandler = (req:Request, res: Response): void => {
	const payload = createNotFoundPayload(req.method,req.url);
	res.status(404).json(payload);
}