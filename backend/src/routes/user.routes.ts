// ============================================
// src/routes/user.routes.ts
// ============================================
import { Router } from 'express';
import { 
	validateBody,
	validateParams,
	validateQuery, 
	// validateParams, 
	// validateQuery 
} from '@/middlewares/validate.middleware';
import {
	RegisterSchema,
	LoginSchema,
	UserIdSchema,
	PaginationSchema,
	// UpdateUserSchema,
	// UserIdSchema,
	// PaginationSchema,
	// ChangePasswordSchema,
} from '@/schemas/user.schema';
import * as userController from '@/controllers/user.controller';
// import { authenticate } from '@/middlewares/auth.middleware'; // Crearemos después

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
// ADMIN ROUTES
// ============================================

/**
 * GET /users
 */
router.get(
	'/',
	// authenticate,
	// authorize('admin'),
	validateQuery(PaginationSchema),
	userController.listUsers
);

/**
 * GET /users/:id
 */
router.get(
	'/:id',
	// authenticate,
	validateParams(UserIdSchema), // ← AQUÍ está la validación
	userController.getUser
);


export default router;