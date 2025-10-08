// import {Request, Response, NextFunction} from 'express';
// import z, {ZodError} from 'zod';
// import {AppError} from '@/middlewares/error.middleware';

// export const validate = (schema:z.ZodObject)=>{
// 	return async (req:Request, _res:Response, next:NextFunction) =>{
// 		try{
// 			//validar y transformar datos
// 			req.body = await schema.parseAsync(req.body);
// 			next();
// 		}catch(error){
// 			if (error instanceof ZodError){ 
// 				// formatear errores de forma legible
// 				// PENDIENTE: ver si funciona ya que he cambiado error.errors por error.issues
// 				const errors = error.issues.map(issue => ({
// 					field: issue.path.join('.'),
// 					message: issue.message
// 				}));

// 				next(new AppError('Validation failed', 400, errors));
// 				return;
// 			}
// 			next(error);
// 		}
// 	}
// }