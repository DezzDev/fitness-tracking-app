// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { userService } from '@/services/user.service';
import { securityEventRepository } from '@/repositories/securityEvent.repository';
import { LoginInput } from '@/schemas/user.schema';
import { ResponseHandler } from '@/utils/response';
import { asyncHandler } from '@/middlewares/error.middleware';

 const errorMessages: Record<string, { status: number; message: string }> = {
        TOKEN_EXPIRED: { status: 401, message: 'Refresh token expired' },
        REFRESH_EXPIRED: { status: 401, message: 'Refresh token expired' },
        INVALID_REFRESH_TOKEN: { status: 401, message: 'Invalid refresh token' },
        TOKEN_REUSE_DETECTED: {
          status: 401,
          message: 'Security violation: All sessions terminated',
        },
        TOKEN_VERSION_MISMATCH: {
          status: 401,
          message: 'Token invalidated',
        },
        USER_NOT_FOUND: { status: 401, message: 'User not found' },
      };



const login = asyncHandler(async (req: Request, res: Response): Promise<undefined> => {

  const input = req.validatedBody as LoginInput;

  const ipAddress = req.ip;
  const deviceInfo = req.get('User-Agent');

  // login retorna user + tokens
  const loginResult = await userService.login(input, { ipAddress, deviceInfo });

  // Configurar refresh token como httpOnly cookie
  res.cookie('refreshToken', loginResult.tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    path: '/'
  })

  // Retornar datos del usuario y access token
  ResponseHandler.success(res, {
    accessToken: loginResult.tokens.accessToken,
    user: loginResult.user
  },
    'Login successful'
  )

})

/**
 * Refresh tokens (con rotación)
 */
const refresh = async (req: Request, res: Response) => {

  try {
    const oldRefreshToken: string = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      ResponseHandler.error(res, {
        success: false,
        error: 'Refresh token not found',
        timestamp: new Date().toISOString()
      }, 401)
    }

    // Refrescar tokens
    const result = await authService.refreshTokens({
      oldRefreshToken,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })

    // Configurar nuevo refresh token como httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días  
      path: '/'
    })

    // Devolver nuevo access token
    ResponseHandler.success(res,
      { accessToken: result.accessToken },
      'Tokens refreshed successfully',
      200
    );

  } catch (error: any) {
    // limpiar cookie si hay error
    res.clearCookie('refreshToken')


    const errorInfo = errorMessages[error.message] ||
      { status: 401, message: 'Token refresh failed' };

    ResponseHandler.error(res, {
      success: false,
      error: errorInfo.message,
      timestamp: new Date().toISOString(),
    }, errorInfo.status);
  }


}

const logout = asyncHandler(async (req: Request, res: Response): Promise<undefined> => {
  const refreshToken = req.cookies.refreshToken;

  await authService.logout({
    refreshToken,
    userId: req.user?.userId,
    ipAddress: req.ip,
  })

  // Limpiar cookie
  res.clearCookie('refreshToken')

  ResponseHandler.success(res, null, 'Logout successful');

})

const logOutAll = asyncHandler(async (req: Request, res: Response): Promise<undefined> => {
  const userId = req.user?.userId; 
  if (!userId) {
    ResponseHandler.error(res, {
      success: false,
      error: 'User not found',
      timestamp: new Date().toISOString()
    }, 404)
    return;
  }

  const reason = 'password_change'; // o cualquier otro motivo relevante

  await authService.revokeAllSessions(userId, reason)

  res.clearCookie('refreshToken')

  ResponseHandler.success(res, null, 'All sessions revoked successfully');

})