// src/middlewares/authorize.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { createAppError } from '@/middlewares/error.middleware';
import logger from '@/utils/logger';

// ============================================
// TIPOS
// ============================================

type UserRole = 'user' | 'admin';

interface AuthorizeOptions {
	requireAll?: boolean; // Si true, requiere TODOS los roles
}

// ============================================
// MIDDLEWARE: Autorización por Roles
// ============================================

/**
 * Middleware para verificar roles de usuario
	* 
 * IMPORTANTE: Debe usarse DESPUÉS de authenticate()
	* 
 * @param allowedRoles - Roles permitidos para acceder
	* @param options - Opciones adicionales
		* 
 * @example
		* // Solo admins
 * router.delete('/users/:id', authenticate(), authorize('admin'), deleteUser);
 * 
 */

export const authorize = (
	allowedRoles: UserRole | UserRole[],
	options: AuthorizeOptions = {}
) => {
	const roles = Array.isArray(allowedRoles) ? allowedRoles : [ allowedRoles ];
	const { requireAll = false } = options;

	return (req: Request, _res: Response, next: NextFunction): void => {

		// Verificar que el usuario esté autenticado
		if (!req.user) {
			logger.error('Authorization check failed: No user in request', {
				path: req.path
			});
			throw createAppError(
				'Authentication required before authorization',
				401,
				false // no es operacional, es un bug de configuración
			);
		}

		const userRole = req.user.role;

		// Verificar roles
		const hasAccess = requireAll
			? roles.every(role => role === userRole) // Requiere todos los roles
			: roles.includes(userRole); // Requiere al menos uno

		if (!hasAccess) {
			logger.warn('Authorization denied', {
				userId: req.user.userId,
				userRole,
				requiredRoles: roles,
				path: req.path
			});

			throw createAppError(
				'Insufficient permissions to access this resource',
				403,
				true,
				{
					code: 'FORBIDDEN',
					requiredRoles: roles,
					userRole
				}
			);
		}

		// log de autorización exitosa
		logger.info('Authorization granted', {
			userId: req.user.userId,
			role: userRole,
			path: req.path
		});

		next();
	};
};

// ============================================
// ALIASES: Atajos comunes
// ============================================

/**
 * Solo administradores
 */
export const requireAdmin = authorize('admin');

/**
 * Usuarios regulares o admins
 */
export const requireUser = authorize([ 'user', 'admin' ]);