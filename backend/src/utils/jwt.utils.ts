// src/utils/jwt.utils

import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '@/config/env';
import { randomBytes } from 'crypto';
import { JWTPayload, RefreshTokenPayload } from '@/types/common/auth.types';
import { createAppError } from '@/middlewares/error.middleware';





// ============================================
// CONSTANTES
// ============================================
const ACCESS_SECRET = env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = env.JWT_ACCESS_EXPIRY;
const REFRESH_TOKEN_EXPIRES_IN = env.JWT_REFRESH_EXPIRY;
const ISSUER_VALUE = 'fitness-tracker-app';
const AUDIENCE_VALUE = 'fitness-tracker-users';


// ============================================
// FUNCIONES PURAS
// ============================================

/**
 * Generar access token (vida corta)
 */
export const generateAccessToken = (
  payload: JWTPayload,

): string => {

  if (!ACCESS_SECRET) {
    throw createAppError('JWT_ACCESS_SECRET not configured', 500, true, { code: 'JWT_ACCESS_SECRET_NOT_CONFIGURED' });
  }


  const signOptions: SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn'],
    issuer: ISSUER_VALUE,
    audience: AUDIENCE_VALUE,
  };

  return jwt.sign(
    payload,
    ACCESS_SECRET,
    signOptions
  );
};

/**
 * Generar refresh token (vida más larga)
 */
export const generateRefreshToken = (payload: JWTPayload): {
  token: string;
  tokenId: string;
  expiresAt: Date;
} => {

  if (!REFRESH_SECRET) {
    throw createAppError('JWT_REFRESH_SECRET not configured', 500, true, { code: 'JWT_REFRESH_SECRET_NOT_CONFIGURED' });
  }

  const tokenId = randomBytes(32).toString('hex'); // ID único para el token

  const signOptions: SignOptions = {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn'],
    issuer: ISSUER_VALUE,
    audience: AUDIENCE_VALUE,
  };
  const token = jwt.sign(
    {
      userId: payload.userId,
      tokenId,
      tokenVersion: payload.tokenVersion
    },
    REFRESH_SECRET,
    signOptions
  )

  // Calcular fecha de expiración
  const decoded = jwt.decode(token) as { exp: number };
  const expiresAt = new Date(decoded.exp * 1000); // convertir a milisegundos
  return { token, tokenId, expiresAt };
};

/**
 * Verificar Access token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET, {
      issuer: ISSUER_VALUE,
      audience: AUDIENCE_VALUE,
    });

    return decoded as JWTPayload;


  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw createAppError('TOKEN_EXPIRED', 401, true, { code: 'TOKEN_EXPIRED' });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw createAppError('INVALID_TOKEN', 401, true, { code: 'INVALID_TOKEN' });
    }

    throw createAppError('TOKEN_VERIFICATION_FAILED', 401, true, { code: 'TOKEN_VERIFICATION_FAILED' });
  }
};

/**
 * Verificar Refresh token
 * @param token
 * @returns payload decodificado si es válido, o lanza error si no lo es
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET, {
      issuer: ISSUER_VALUE,
      audience: AUDIENCE_VALUE,
    });

    return decoded as RefreshTokenPayload;

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw createAppError('REFRESH_EXPIRED', 401, true, { code: 'REFRESH_EXPIRED' });
    }
    throw createAppError('INVALID_REFRESH_TOKEN', 401, true, { code: 'INVALID_REFRESH_TOKEN' });
  }
}


/**
 * Extraer token del header Authorization
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) {
    return null;
  }

  // formato esperado "Bearer <token>"
  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return null;
  }

  return parts[1];
};

/**
 * Decodificar token sin verificar (para debugging)
 */
export const decodeToken = (token: string): any | null => {

  const decoded = jwt.decode(token);

  if (typeof decoded === 'object' &&
    decoded !== null &&
    'tokenId' in decoded
  ) {
    return decoded as RefreshTokenPayload;

  } else if (typeof decoded === 'object' &&
    decoded !== null &&
    'userId' in decoded
  ) {
    return decoded as JWTPayload;
    
  } else
    return null;

};
