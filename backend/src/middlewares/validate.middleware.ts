// validate.middleware

import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodType } from 'zod';
import { createAppError } from '@/middlewares/error.middleware';
import logger from '@/utils/logger';



// ============================================
// TIPOS
// ============================================

type ValidateTarget = 'body' | 'params' | 'query';

interface ValidationOptions {
	stripUnknown?: boolean;
	abortEarly?: boolean;
}

// ============================================
// FUNCIONES PURAS
// ============================================

const validateData = async <T extends ZodType>(
	schema: T,
	data: unknown,
	options: ValidationOptions = {},

): Promise<z.infer<T>> => {
	try {
		// Puedes usar options aquí en el futuro
		console.log(options);

		return await schema.parseAsync(data);

	} catch (error) {
		if (error instanceof ZodError) {
			throw error;
		}
		throw new Error('Validation failed');
	}
};

const extractData = (req: Request, target: ValidateTarget): unknown => {
	switch (target) {
		case 'body':
			return req.body;
		case 'params':
			return req.params;
		case 'query':
			return req.query;
		default:
			return null;
	}
};

const formatZodErrors = (error: ZodError): { field: string; message: string }[] =>
	error.issues.map(issue => ({
		field: issue.path.join('.') || 'root',
		message: issue.message,
	}));

const assignData = (
	req: Request,
	target: ValidateTarget,
	data: unknown
): void => {
	switch (target) {
		case 'body':
			req.body = data;
			break;
		case 'params':
			req.params = data as Record<string, string>;
			break;
		case 'query':
			req.query = data as Record<string, string>;
			break;
		default:
			break;
	}
};


// ============================================
// MIDDLEWARE: Validador Principal
// ============================================

export const validate = (
	schema: ZodType,
	target: ValidateTarget = 'body',
	options: ValidationOptions = {}
) => {
	return async (
		req: Request,
		_res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			// 1. Extraer datos según el target
			const data = extractData(req, target);
			// 2. Validar con Zod
			const validatedData = await validateData(schema, data, options);

			// 3. Asignar datos validados de vuelta a req
			assignData(req, target, validatedData);

			// 4. Continuar al siguiente middleware
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				const errors = formatZodErrors(error);
				next(createAppError('Validation failed', 400, true, errors));
			} else if (error instanceof Error) {
				next(createAppError(error.message, 500));
			} else {
				next(createAppError('Unknown validation error', 500));
			}
		}
	};
};

// ============================================
// MIDDLEWARES ESPECÍFICOS (Aliases)
// ============================================

export const validateBody = (schema: ZodType, options: ValidationOptions = {}) =>
	validate(schema, 'body', options);

export const validateParams = (schema: ZodType, options: ValidationOptions = {}) =>
	validate(schema, 'params', options);

export const validateQuery = (schema: ZodType, options: ValidationOptions = {}) =>
	validate(schema, 'query', options);

// ============================================
// MIDDLEWARE: Multi-validación (Body + Query + Params)
// ============================================

interface MultiValidateSchemas {
	body?: ZodType;
	params?: ZodType;
	query?: ZodType;
}

export const validateMulti = (schemas: MultiValidateSchemas) => {
	return async (
		req: Request,
		_res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			if (schemas.body) {
				const validateBody = await validateData(schemas.body, req.body);
				req.body = validateBody;
			}

			if (schemas.query) {
				const validateQuery = await validateData(schemas.query, req.query);
				req.query = validateQuery as Record<string, string>;
			}

			if (schemas.params) {
				const validateParams = await validateData(schemas.params, req.params);
				req.params = validateParams as Record<string, string>;
			}

			next();
		} catch (error) {
			if (error instanceof ZodError) {
				const errors = formatZodErrors(error);
				next(createAppError('Validation failed', 400, true, errors));
			} else if (error instanceof Error) {
				next(createAppError(error.message, 500));
			} else {
				next(createAppError('Unknown validation error', 500));
			}
		}
	};
};

// ============================================
// MIDDLEWARE: Transformador de Datos
// ============================================

// Nota: Similar a validate, pero solo transforma sin validar estrictamente
// Útil para convertir tipos, formatear fechas, etc.
// pendiente de uso real

export const transform = (
	schema: ZodType,
	target: ValidateTarget = 'body'
) => {
	return async (
		req: Request,
		_res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			const data = extractData(req, target);
			const transformedData = await schema.parseAsync(data);
			assignData(req, target, transformedData);
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				const errors = formatZodErrors(error);
				next(createAppError('Transformation failed', 400, true, errors));
			} else {
				next(createAppError('Unknown transformation Error', 500));
			}
		}
	};
};