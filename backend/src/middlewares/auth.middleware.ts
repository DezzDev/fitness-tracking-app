// src/middlewares/auth.meddleware.ts

import { Request, Response, NextFunction } from 'express';
import { createAppError } from '@/middlewares/error.middleware';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt.utils';
import logger from '@/utils/logger';
import { env } from '@/config/env';



// ============================================
// TIPOS
// ============================================

interface AuthOptions {
	required?: boolean;
	allowExpired?: boolean;
}

// ============================================
// MIDDLEWARE: Autenticación
// ============================================

/**
 * Middleware para verificar autenticación JWT
 * 
 * @param options - Opciones de configuración
 * @param options.required - Si es true, lanza error si no hay token (default: true)
 * @param options.allowExpired - Si es true, permite tokens expirados (default: false)
 * 
 * @example
 * // Autenticación requerida (default)
 * router.get('/profile', authenticate(), getProfile);
 * 
 * // Autenticación opcional
 * router.get('/posts', authenticate({ required: false }), listPosts);
 */
export const authenticate = (options: AuthOptions = {}) => {
	const { required = true, allowExpired = false } = options;

	return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {

		try {
			// Extraer token del header
			const token = extractTokenFromHeader(req.headers.authorization);

			// Si no hay token y es opcional, continuar sin autenticar
			if (!token && !required) {
				return next();
			}

			// Si no hay token y es requerido, error
			if (!token) {
				throw createAppError('Authorization token is required', 401, true, { code: 'NO_TOKEN' });
			}

			// Verificar y decodificar token
			const payload = verifyToken(token);


			// Adjuntar usuario a la request

			req.user = {
				userId: payload.userId,
				email: payload.email,
				role: payload.role,
			};

			// Log de autenticación exitosa (en modo desarrollo)
			if (env.NODE_ENV === 'development') {
				logger.debug('User authenticated', {
					userId: payload.userId,
					email: payload.email,
					role: payload.role,
					path: req.path,
				});
			}

			next();

		} catch (error) {
			
			// Si allowExpired y el error es TOKEN_EXPIRED, permitir
			if(
				allowExpired &&
				error instanceof Error &&
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(error as any).details?.code === 'TOKEN_EXPIRED'
			){
				return next();
			}

			// Log de error de autenticación
			logger.warn('Authentication failed', {
				error: error instanceof Error ? error.message : 'Unknown',
				path: req.path,
				ip: req.ip,
			});

			next(error);
		}
	};
};


// ============================================
// ALIASES: Atajos comunes
// ============================================

/**
 * Autenticación requerida (alias de authenticate())
 */
export const requireAuth = authenticate();

/**
 * Autenticación opcional (permite continuar sin token)
 */
export const optionalAuth = authenticate({ required: false });