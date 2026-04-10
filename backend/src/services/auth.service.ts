// src/services/auth.service.ts

import { refreshTokenRepository } from "@/repositories/refreshToken.repository";
import { securityEventRepository } from "@/repositories/securityEvent.repository";
import { RefreshTokenPayload } from "@/types/common/auth.types";
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
  generateTokenPair: async (
    userId: string,
    role: string,
    tokenVersion: number,
    parentTokenId?: string,
    deviceInfo?: string,
    ipAddress?: string
  ):Promise<{ accessToken: string; refreshToken: string, tokenId:string }> => {
  
    try {
      // Generar access token
      const accessToken = generateAccessToken({
        userId:userId,
        role: role,
        tokenVersion: tokenVersion
      })
  
      // Generar refresh token
      const {token:refreshToken, tokenId, expiresAt} = generateRefreshToken({
        userId: userId,
        role: role,
        tokenVersion: tokenVersion
      })
  
      // Guardar refresh token en base de datos
      await refreshTokenRepository.create({
        userId: userId,
        tokenId,
        expiresAt,
        parentTokenId: parentTokenId || null,
        deviceInfo: deviceInfo || null,
        ipAddress: ipAddress || null
      })
  
      return { accessToken, refreshToken, tokenId };
      
    } catch (error) {
      throw handleServiceError(
        error,
        'AuthService.generateTokenPair',
        'Unable to generate token pair',
        { userId, role, tokenVersion, parentTokenId, deviceInfo, ipAddress }  
      );
    }
  },

  /**
   * Refrescar tokens (con rotación)
   */
  refreshToken : async (oldRefreshToken:string, ipAddress?:string, userAgent?:string) =>{
    try {
      // Verificar firma del refresh token
      let decoded: RefreshTokenPayload
      decoded = verifyRefreshToken(oldRefreshToken);

      // Buscar token en base de datos
      const storedToken = await refreshTokenRepository.findByTokenId(decoded.tokenId)

      // Detección de reuso del token
      if(!storedToken){
        // token no existe o ya fue revocado
        const revokedToken = await refreshTokenRepository.findByTokenIdIncludeRevoked(decoded.tokenId);

        if(revokedToken && revokedToken.revoked){
          // Token válido pero ya usado = ATAQUE
          logger.warn(`Token reuse detected for user ${decoded.userId}`)

          // Revocamos toda la familia
          await refreshTokenRepository.revokeTokenFamily(decoded.tokenId)

          // Registrar evento de seguridad
          await securityEventRepository.create({
            userId: decoded.userId,
            eventType: 'token_reuse',
            ipAddress: ipAddress || null,
            userAgent: userAgent || null,
            tokenId: decoded.tokenId,
            success: false,
            details: 'Refresh token reuse detected, token family revoked'
          })
        }
      }


    }catch (error){
      throw handleServiceError(
        error,
        'AuthService.refreshToken', 
        'Invalid refresh token',
        { oldRefreshToken, ipAddress, userAgent }
      );
    }
  }
}