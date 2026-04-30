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
import { authService } from '@/services/auth.service';
import {
  getRefreshTokenCookieOptions,
  getRefreshTokenClearCookieOptions,
} from '@/utils/cookie.utils';


// ============================================
// HELPER: Extraer y validar ID
// ============================================

const extractId = (params: Record<string, string | undefined>): string => {
  const { id } = params;

  if (!id) {
    throw createAppError('User ID not found in request', 400);
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

  // Configurar refresh token como httpOnly cookie
  res.cookie('refreshToken', result.tokens.refreshToken, getRefreshTokenCookieOptions());

  // Devolver access token y usuario
  ResponseHandler.success(
    res,
    {
      user: result.user,
      accessToken: result.tokens.accessToken
    },
    'Login successfully');
});

/**
 * POST /users/demo-login
 * Login de demo temporal
 */
export const demoLogin = asyncHandler(async (_req: Request, res: Response): Promise<undefined> => {
  const result = await userService.demoLogin();

  res.cookie('refreshToken', result.tokens.refreshToken, getRefreshTokenCookieOptions());

  ResponseHandler.success(
    res,
    {
      user: result.user,
      accessToken: result.tokens.accessToken
    },
    'Demo login successfully'
  );
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
  const data = req.validatedBody as UpdateUserInput;
  const user = req.user; // del middleware de auth

  if (!user) {
    throw createAppError('User not authenticated', 401);
  }

  // si el usuario no es admin y no intenta actualizar su propio perfil, error
  if (user.role !== 'admin' && user.userId !== id) {
    throw createAppError('You are not authorized to update this user', 403);
  }

  const userUpdated = await userService.update(id, data);

  ResponseHandler.success(res, userUpdated, 'User updated successfully');
});

/**
 * DELETE /users/:id
 * Eliminar usuario - desactivar (soft delete)
 */
export const softDeleteUser = asyncHandler(async (req: Request, res: Response): Promise<undefined> => {
  const id = extractId(req.validatedParams as UserIdParam);
  await userService.softDelete(id);

  ResponseHandler.noContent(res);

});

/**
 * DELETE /users/:id
 * Eliminar usuario permanentemente (hard delete)
 */
export const hardDeleteUser = asyncHandler(async (req: Request, res: Response): Promise<undefined> => {
  const id = extractId(req.validatedParams as UserIdParam);
  console.log({ id });
  await userService.hardDelete(id);

  ResponseHandler.noContent(res);

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
 * POST /users/me/profile-image
 * Subir imagen de perfil
 */
export const uploadProfileImage = asyncHandler(async (req: Request, res: Response): Promise<undefined> => {
  if (!req.user) {
    throw createAppError('User not authenticated', 401);
  }

  if (!req.file) {
    throw createAppError('No image provided', 400);
  }

  const userUpdated = await userService.updateProfileImage(req.user.userId, req.file.buffer);

  ResponseHandler.success(res, userUpdated, 'Profile image updated successfully');
});

/**
 * DELETE /users/me/profile-image
 * Eliminar imagen de perfil
 */
export const deleteProfileImage = asyncHandler(async (req: Request, res: Response): Promise<undefined> => {
  if (!req.user) {
    throw createAppError('User not authenticated', 401);
  }

  const userUpdated = await userService.deleteProfileImage(req.user.userId);

  ResponseHandler.success(res, userUpdated, 'Profile image deleted successfully');
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

    // Revocar todas las sesiones (tokens) del usuario para forzar re-login
    await authService.revokeAllSessions(userId);

    // Limpiar cookie del dispositivo actual
    res.clearCookie('refreshToken', getRefreshTokenClearCookieOptions());

    ResponseHandler.success(
      res,
      null,
      'Password changed successfully. Please log in again.');
  });
