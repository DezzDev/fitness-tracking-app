// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { ResponseHandler } from '@/utils/response';
import { asyncHandler, createAppError } from '@/middlewares/error.middleware';
import {
  getRefreshTokenCookieOptions,
  getRefreshTokenClearCookieOptions,
} from '@/utils/cookie.utils';

/**
 * POST /auth/refresh
 * Refresh tokens (con rotación)
 */
export const refresh = asyncHandler(
  async (req: Request, res: Response): Promise<undefined> => {
  
    const oldRefreshToken = req.cookies?.refreshToken;

    if(!oldRefreshToken){
      throw createAppError('Refresh token missing', 401, true)
    }
    
    // Refrescar tokens
    const result = await authService.refreshTokens({
      oldRefreshToken,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || 'unknown',
    })

    // configurar Nuevo refresh token en cookie
    res.cookie('refreshToken', result.refreshToken, getRefreshTokenCookieOptions())

    // Devolver nuevo access token
    ResponseHandler.success(
      res,
      {accessToken: result.accessToken},
      'Tokens refreshed successfully'
    )
  
  })

/**
 * POST /auth/logout
 * Logout (revocar refresh token)
 */
export const logout = asyncHandler(async (req: Request, res: Response): Promise<undefined> => {
  const refreshToken = req.cookies.refreshToken;

  await authService.logout({
    refreshToken,
    userId: req.user?.userId,
    ipAddress: req.ip,
  })

  // Limpiar cookie
  res.clearCookie('refreshToken', getRefreshTokenClearCookieOptions())

  ResponseHandler.success(res, null, 'Logout successful');

})

/**
 * POST /auth/logout-all
 * Logout de todas las sesiones (revocar todos los refresh tokens)
 */
export const logoutAll = asyncHandler(async (req: Request, res: Response): Promise<undefined> => {
  if (!req.user) {
    throw createAppError('User not authenticated', 401, true);
  }
  const userId = req.user?.userId; 
  await authService.revokeAllSessions(userId)

  res.clearCookie('refreshToken', getRefreshTokenClearCookieOptions())

  ResponseHandler.success(res, null, 'All sessions revoked successfully');

})
