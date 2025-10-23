// ============================================
// src/routes/user.routes.ts
// ============================================
import { Router } from 'express';
import {
	validateBody,
	validateParams,
	validateQuery,

} from '@/middlewares/validate.middleware';
import {
	RegisterSchema,
	LoginSchema,
	UserIdSchema,
	PaginationSchema,
	ChangePasswordSchema,
	UpdateUserSchema,
} from '@/schemas/user.schema';
import * as userController from '@/controllers/user.controller';
import { authenticate, requireAuth } from '@/middlewares/auth.middleware'; // Crearemos después
import { authorize } from '@/middlewares/authorize.middleware';

const router: Router = Router();

// ============================================
// PUBLIC ROUTES (No requieren autenticación)
// ============================================

/**
 * POST /users/register
 * Registrar nuevo usuario
 */
router.post('/register', validateBody(RegisterSchema), userController.register);

/**
 * POST /users/login
 * Login
 */
router.post('/login', validateBody(LoginSchema), userController.login);

// ============================================
// PROTECTED ROUTES (Usuario autenticado)
// ============================================

/**
 * GET /users/me
 * Obtener perfil del usuario autenticado
 */
router.get(
	'/me',
	requireAuth,
	userController.getProfile
);

/**
 * PATCH /users/me/password
 * Cambiar contraseña del usuario autenticado
 */
router.patch(
	'/me/password',
	requireAuth,
	validateBody(ChangePasswordSchema),
	userController.changePassword
);

// ============================================
// ADMIN ROUTES (Solo administradores)
// ============================================

/**
 * GET /users
 * Listar todos los usuarios
 */
router.get(
	'/',
	requireAuth,
	authorize([ 'admin' ]),
	validateQuery(PaginationSchema),
	userController.listUsers
);

/**
 * GET /users/:id
 * Obtener usuario específico
 */
router.get(
	'/:id',
	requireAuth,
	authorize([ 'admin' ]),
	validateParams(UserIdSchema),
	userController.getUser
);

/**
 * PATCH /users/:id
 * Actualizar usuario
 */
router.patch(
	'/:id',
	authenticate(),
	validateParams(UserIdSchema),
	validateBody(UpdateUserSchema),
	userController.updateUser
);

/**
 * DELETE /users/:id 
 * Eliminar usuario (soft delete)
 */
router.delete(
	'/:id',
	authenticate(),
	authorize('admin'),
	validateParams(UserIdSchema),
	userController.deleteUser
);

/**
 * DELETE /users/:id 
 * Eliminar usuario (hard delete)
 */
router.delete(
	'/:id',
	authenticate(),
	authorize('admin'),
	validateParams(UserIdSchema),
	userController.HardDeleteUser
);



export default router;