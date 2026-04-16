// src/services/auth.service.ts

import { createAppError } from "@/middlewares/error.middleware";
import { refreshTokenRepository } from "@/repositories/refreshToken.repository";
import { securityEventRepository } from "@/repositories/securityEvent.repository";
import { userRepository } from "@/repositories/user.repository";
import { RefreshTokenPayload, Role } from "@/types/common/auth.types";
import { SecurityEventType } from "@/types/entities/securityEvent.types";
import { handleServiceError } from "@/utils/error.utils";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "@/utils/jwt.utils";
import logger from "@/utils/logger";

//=================================
// Service
//=================================

export const authService = {
  /**
   * Crear par de tokens (access token y refresh token)
   * @param data - Datos necesarios para generar los tokens
   * @returns accessToken, refreshToken y tokenId del refresh token para seguimiento
   */
  generateTokenPair: async (data: {
    userId: string,
    role: Role,
    tokenVersion: number,
    parentTokenId?: string,
    deviceInfo?: string,
    ipAddress?: string
  }
  ): Promise<{ accessToken: string; refreshToken: string, tokenId: string }> => {

    try {
      // Generar access token
      const accessToken = generateAccessToken({
        userId: data.userId,
        role: data.role,
        tokenVersion: data.tokenVersion
      })

      // Generar refresh token
      const { token: refreshToken, tokenId, expiresAt } = generateRefreshToken({
        userId: data.userId,
        role: data.role,
        tokenVersion: data.tokenVersion
      })

      // Guardar refresh token en base de datos
      await refreshTokenRepository.create({
        userId: data.userId,
        tokenId,
        expiresAt,
        parentTokenId: data.parentTokenId,
        deviceInfo: data.deviceInfo,
        ipAddress: data.ipAddress
      })

      return { accessToken, refreshToken, tokenId };

    } catch (error) {
      throw handleServiceError(
        error,
        'AuthService.generateTokenPair',
        'Unable to generate token pair',
        { userId: data.userId, role: data.role, tokenVersion: data.tokenVersion, parentTokenId: data.parentTokenId, deviceInfo: data.deviceInfo, ipAddress: data.ipAddress }
      );
    }
  },

  /**
   * Refrescar tokens (con rotación)
   * @param oldRefreshToken - El refresh token que se va a rotar
   * @param ipAddress - IP del cliente (opcional, para logging)
   * @param userAgent - User agent del cliente (opcional, para logging)
   * @returns Nuevo access token, refresh token y datos del usuario
   */
  refreshTokens: async (data: { oldRefreshToken: string, ipAddress?: string, userAgent?: string }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
    };
  }> => {
    try {
      // Verificar firma del refresh token
      const decoded: RefreshTokenPayload = verifyRefreshToken(data.oldRefreshToken);

      // Buscar token en base de datos
      const storedToken = await refreshTokenRepository.findByTokenId(decoded.tokenId)

      // Detección de reuso del token
      if (!storedToken) {
        // token no existe o ya fue revocado
        const revokedToken = await refreshTokenRepository.findByTokenIdIncludeRevoked(decoded.tokenId);

        if (revokedToken && revokedToken.revoked) {
          // Token válido pero ya usado = ATAQUE
          logger.error(`Token reuse detected for user ${decoded.userId}`)

          // Revocamos toda la familia
          await refreshTokenRepository.revokeTokenFamily(decoded.tokenId)

          // Registrar evento de seguridad
          await securityEventRepository.create({
            userId: decoded.userId,
            eventType: 'token_reuse',
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            tokenId: decoded.tokenId,
            success: false,
            details: 'Refresh token reuse detected, token family revoked'
          })
          throw createAppError(
            'TOKEN_REUSE_DETECTED',
            401,
            true
          );
        }

        throw createAppError(
          'INVALID_REFRESH_TOKEN',
          401,
          true);
      }

      // Validar usuario y token version (en caso de que el usuario haya cambiado su contraseña o se haya revocado manualmente)
      const user = await userRepository.findById(decoded.userId);

      if (!user) {
        throw createAppError('USER_NOT_FOUND', 404, true);
      }

      if (user.tokenVersion !== decoded.tokenVersion) {
        throw createAppError('TOKEN_VERSION_MISMATCH', 401, true);
      }

      // Revocar token viejo antes de crear el nuevo (rotación)
      await refreshTokenRepository.revokedByTokenId(decoded.tokenId, 'rotated')

      // Generar nuevo par de tokens
      const tokens = await authService.generateTokenPair({
        userId: user.id,
        role: user.role,
        tokenVersion: user.tokenVersion || 0,
        parentTokenId: decoded.tokenId,
        deviceInfo: data.userAgent,
        ipAddress: data.ipAddress
      });

      // Registrar evento de seguridad
      await securityEventRepository.create({
        userId: user.id,
        eventType: 'token_refresh',
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        tokenId: decoded.tokenId,
        success: true,
        details: 'Refresh token rotated successfully'
      })

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }


    } catch (error) {
      throw handleServiceError(
        error,
        'AuthService.refreshToken',
        'Invalid refresh token',
        { oldRefreshToken: data.oldRefreshToken, ipAddress: data.ipAddress, userAgent: data.userAgent }
      );
    }
  },

  logout: async (data: {
    refreshToken?: string,
    userId?: string,
    ipAddress?: string,

  }): Promise<void> => {

    try {
      if (data.refreshToken) {
        const decoded = verifyRefreshToken(data.refreshToken);

        if (decoded?.tokenId) {
          await refreshTokenRepository.revokedByTokenId(decoded.tokenId, 'logout')

          // Registrar evento de seguridad
          if (decoded.userId) {
            await securityEventRepository.create({
              userId: decoded.userId,
              eventType: 'logout',
              tokenId: decoded.tokenId,
              ipAddress: data.ipAddress,
              success: true,
              details: 'User logged out successfully'
            })
          }

        }

      }
    } catch (error) {
       // No lanzar error en logout, solo loguear
      logger.warn('Logout error', { error });
    }

  },

  /**
   * Revocar todas las sesiones (cambio de contraseña)
   */
  revokeAllSessions: async (userId: string) => {
    try {
      // Incrementar token version del usuario para invalidar todos los tokens existentes
      await userRepository.incrementTokenVersion(userId);

      const reason: SecurityEventType = 'password_change';
      // Revocar todos los refresh tokens
      await refreshTokenRepository.revokedAllByUserId(userId,reason )

      // Registrar evento de seguridad
      await securityEventRepository.create({
        userId,
        eventType: reason,
        success: true,
        details: 'All user sessions revoked due to password change'
      });


    } catch (error) {
      throw handleServiceError(
        error,
        'AuthService.revokeAllSessions',
        'Unable to revoke all sessions',
        { userId }
      );
    }


  }
}