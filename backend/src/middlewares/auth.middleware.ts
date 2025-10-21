// src/middlewares/auth.meddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createAppError } from '@/middlewares/error.middleware';
import { env } from '@/config/env';
import { userService } from '@/services/user.service';

// Extender request para incluir user
export interface AuthRequest extends Request {
	user?: {
		userId: string;
		email: string;
		role: string;
	}
}

// ============================================
// MIDDLEWARE: Auth Principal
// ============================================


export const authenticate = async (
	req: AuthRequest,
	_res: Response,
	next: NextFunction
) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			throw createAppError('Authorization token missing in headers', 401);
		}

		const token = authHeader.split(' ')[ 1 ];
		if (!token) {
			throw createAppError('Authorization token missing', 401);
		}

		// Verificar token
		const payload = jwt.verify(token, env.JWT_SECRET) as
			{ userId: string; email: string; role: string };

		// validar que el usuario exista
		const user = await userService.findById(payload.userId);
		if (!user) {
			throw createAppError('User not found', 401);
		}

		// Guardar info del usuario en la request
		req.user = {
			userId: payload.userId,
			email: payload.email,
			role: payload.role,
		};

		next();


	} catch (error) {
		next(createAppError('Unauthorized', 401, true, error));
	}
};

// ============================================
// MIDDLEWARE: Authorize Principal
// ============================================

export const authorize = (roles: string[]) =>
	(req: AuthRequest, _res: Response, next: NextFunction) => {
		if (!req.user || !roles.includes(req.user.role)) {
			 next(createAppError('Forbidden: You do not have access to this resource', 403));
		}
		next();
	};
