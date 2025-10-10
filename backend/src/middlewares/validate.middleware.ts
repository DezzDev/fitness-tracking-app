import {Request, Response, NextFunction} from 'express';
import z, {ZodError, ZodType, , } from 'zod';
import {createAppError} from '@/middlewares/error.middleware';

// ============================================
// TIPOS
// ============================================

type ValidateTarget = 'body' | 'params' | 'query';

type ValidationOptions = {
	stripUnknown?: boolean;
	abortEarly?: boolean;
}

// ============================================
// FUNCIONES PURAS
// ============================================

const validateData = async <T extends ZodType<any, any, any>>(
	schema: T,
	data: unknown,
	options: ValidationOptions = {},

):Promise<z.infer<T>> =>{
	return await schema.parseAsync(data);

}catch (error){
	if (error instanceof ZodError) {
		throw error;
	}
	throw new Error('Validation failed');
}