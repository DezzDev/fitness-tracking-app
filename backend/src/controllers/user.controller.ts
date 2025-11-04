// user.controller
import { Request, Response } from 'express';
import { asyncHandler, createAppError } from '@/middlewares/error.middleware';
import { ResponseHandler } from '@/utils/response';
import { userService } from '@/services/user.service';
import {
	RegisterInput,
	LoginInput,
	UpdateUserInput,
	PaginationQuery,
	ChangePasswordInput,
	UserIdParam
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

	const input = req.validatedBody as RegisterInput;

	const result = await userService.register(input);

	ResponseHandler.created(res, result, 'User register successfully');
});

/**
 * POST /users/login
 * Login de usuario
 */
export const login = asyncHandler(async (req: Request, res: Response): Promise<undefined> => {

	const input = req.validatedBody as LoginInput;

	const result = await userService.login(input);

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
	const id = extractId(req.validatedParams as UserIdParam);

	const user = await userService.findById(id);

	ResponseHandler.success(res, user);

});

/**
 * GET /users
 * Listar usuarios (paginado)
 */
export const listUsers = asyncHandler(async (req: Request, res: Response): Promise<undefined> => {
	const { page, limit } = req.validatedQuery as PaginationQuery;

	const result = await userService.findAll(
		page ? page : 1,
		limit ? limit : 10
	);

	ResponseHandler.success(res, result);
});

/**
 * PATCH /users/:id
 * Actualizar usuario
 */
export const updateUser = asyncHandler(async (req: Request, res: Response): Promise<undefined> => {
	const id = extractId(req.validatedParams as UserIdParam);
	const data: UpdateUserInput = req.body;

	const user = await userService.update(id, data);

	ResponseHandler.success(res, user, 'User updated successfully');
});

/**
 * DELETE /users/:id
 * Eliminar usuario - desactivar (soft delete)
 */
export const softDeleteUser = asyncHandler(async (req: Request, res: Response): Promise<undefined> => {
	const id = extractId(req.validatedParams as UserIdParam);
	await userService.softDelete(id);

	ResponseHandler.success(res, null, 'User deleted successfully');

});

/**
 * DELETE /users/:id
 * Eliminar usuario permanentemente (hard delete)
 */
export const hardDeleteUser = asyncHandler(async (req: Request, res: Response): Promise<undefined> => {
	const id = extractId(req.validatedParams as UserIdParam);
	console.log({ id });
	await userService.hardDelete(id);

	ResponseHandler.success(res, null, 'User hard deleted successfully');

});

/**
 * GET /users/me
 * Obtener perfil del usuario autenticado
 */
export const getProfile = asyncHandler(async (req: Request, res: Response): Promise<undefined> => {

	// no se debería dar el caso porque el middleware de auth ya lo verifica
	// pero lo prefiero a usar el operador "!" por seguridad
	if (!req.user) {
		throw createAppError('User not authenticated', 401);
	}
	const userId = req.user.userId;

	const user = await userService.findById(userId);

	ResponseHandler.success(res, user);
});

/**
 * PATCH /users/me/password
 * Cambiar contraseña del usuario autenticado
 */

export const changePassword = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {

		// no se debería dar el caso porque el middleware de auth ya lo verifica
		// pero lo prefiero a usar el operador "!" por seguridad
		if (!req.user) {
			throw createAppError('User not authenticated', 401);
		}
		const userId = req.user.userId;

		const { oldPassword, newPassword } = req.validatedBody as ChangePasswordInput;

		await userService.changePassword(userId, oldPassword, newPassword);

		ResponseHandler.success(res, null, 'Password changed successfully');
	});