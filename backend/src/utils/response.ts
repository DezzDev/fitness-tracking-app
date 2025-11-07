// src/utils/response.ts
import { Response } from "express";

// ============================================
// TIPOS
// ============================================

import { ApiResponse } from '@/types/common/common.types';

export const ResponseHandler = {
	success<T>(res: Response, data: T, message = 'Success', statusCode = 200): Response {
		const payload: ApiResponse<T> = {
			success: true,
			message,
			data,
			timestamp: new Date().toISOString(),
		};
		return res.status(statusCode).json(payload);
	},

	created<T>(res: Response, data: T, message = 'Resource created'): Response {
		return ResponseHandler.success(res, data, message, 201);
	},

	error(res: Response, payload: {
		success: false;
		error: string;
		details?: unknown;
		timestamp: string;
		stack?: string;
	}, statusCode = 500): Response {
		const response: ApiResponse = {
		...payload,
		};
		return res.status(statusCode).json(response);
	},

	

	noContent(res: Response): Response {
		return res.status(204).send();
	}
};