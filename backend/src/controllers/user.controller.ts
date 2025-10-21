// user.controller
import { Request, Response } from 'express';
import { asyncHandler, createAppError } from '@/middlewares/error.middleware';
import { ResponseHandler } from '@/utils/response';
import { userService } from '@/services/user.service';
import {
	RegisterInput,
	LoginInput,
	UpdateUserInput
} from '@/schemas/user.schema';

// ============================================
// HELPER: Extraer y validar ID
// ============================================
const extractId = (params: Record<string, string | undefined>): string => {
	const { id } = params;

	if (!id) {
		throw createAppError('User ID is required', 400);
	}

	return id;
};

// ============================================
// AUTH CONTROLLERS
// ============================================

/**
 * POST /users/register
 * Registrar nuevo usuario
 */
export const register = asyncHandler(async (req: Request, res: Response): Promise<undefined> => {
	const data: RegisterInput = req.body;

	const result = await userService.register(data);

	ResponseHandler.created(res, result, 'User register successfully');
});

/**
 * POST /users/login
 * Login de usuario
 */
export const login = asyncHandler(async (req: Request, res: Response): Promise<undefined> => {

	const data: LoginInput = req.body;

	const result = await userService.login(data.email, data.password);

	ResponseHandler.success(res, result, 'Login successfully');
});

// ============================================
// USER CRUD CONTROLLERS
// ============================================

/**
 * GET /users/:id
 * Obtener usuario por ID
 */
export const getUser = asyncHandler(async (req: Request, res: Response): Promise<undefined> => {
	const id = extractId(req.params);

	const user = await userService.findById(id);

	ResponseHandler.success(res, user);

});

/**
 * GET /users
 * Listar usuarios (paginado)
 */
export const listUsers = asyncHandler(async (req: Request, res: Response): Promise<undefined> => {
	const { page, limit } = req.query as { page?: string; limit?: string };

	const result = await userService.findAll(
		page ? parseInt(page) : 1,
		limit ? parseInt(limit) : 10
	);

	ResponseHandler.success(res, result);
});

/**
 * PATCH /users/:id
 * Actualizar usuario
 */
export const updateUser = asyncHandler(async (req: Request, res: Response): Promise<undefined> => {
	const id = extractId(req.params);
	const data: UpdateUserInput = req.body;

	const user = await userService.update(id, data);

	ResponseHandler.success(res, user, 'User updated successfully');
});

/**
 * DELETE /users/:id
 * Eliminar usuario
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response): Promise<undefined> => {
	const id = extractId(req.params);
	await userService.delete(id);

	ResponseHandler.noContent(res);

});

/**
 * GET /users/me
 * Obtener perfil del usuario autenticado
 */
// export const getProfile = asyncHandler(async (req: Request, res: Response): Promise<undefined> => {
// 	// Asumiendo que tienes un middleware de auth que añade req.user
// 	const userId = (req as any).user?.userId;

// 	const user = await userService.findById(userId);

// 	ResponseHandler.success(res, user);
// });

// /**
//  * PATCH /users/me/password
//  * Cambiar contraseña del usuario autenticado
//  */

// export const changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
// 	const userId = (req as any).user?.userId;
// 	const { oldPassword, newPassword } = req.body;

// 	await userService.changePassword(userId, oldPassword, newPassword);

// 	ResponseHandler.success(res, null, 'Password changed successfully');
// });