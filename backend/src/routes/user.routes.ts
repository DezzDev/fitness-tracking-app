// ============================================
// src/routes/user.routes.ts
// ============================================
import { Router } from 'express';
import { 
	validateBody, 
	// validateParams, 
	// validateQuery 
} from '@/middlewares/validate.middleware';
import {
	RegisterSchema,
	LoginSchema,
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

export default router;