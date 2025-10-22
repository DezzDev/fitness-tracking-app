// src/utils/jwt.utils

import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '@/config/env';
import { createAppError } from '@/middlewares/error.middleware';



// ============================================
// TIPOS
// ============================================

export interface JwtPayload {
	userId: string;
	email: string;
	role: 'user' | 'admin';
}

interface TokenOptions {
	expiresIn?: string;
}


// ============================================
// CONSTANTES
// ============================================

const DEFAULT_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_IN = '30d';
// const SALT_ROUNDS = 10;

// ============================================
// FUNCIONES PURAS
// ============================================

/**
 * Generar token JWT
 */
export const generateToken = (
	payload: JwtPayload,
	options: TokenOptions = {}
): string => {

	const { expiresIn = DEFAULT_EXPIRES_IN } = options;

	const signOptions: SignOptions = {
		expiresIn: expiresIn as SignOptions[ 'expiresIn' ],
		issuer: 'fitness-tracker-app',
		audience: 'fitness-tracker-users',
	};

	return jwt.sign(
		payload,
		env.JWT_SECRET,
		signOptions
	);
};

/**
 * Generar refresh token (vida más larga)
 */
export const generateRefreshToken = (payload: JwtPayload): string => {
	return generateToken(payload, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
};

/**
 * Verificar y decodificar token
 */
export const verifyToken = (token: string): JwtPayload => {
	try {
		const decoded = jwt.verify(token, env.JWT_SECRET, {
			issuer: 'fitness-tracker-app',
			audience: 'fitness-tracker-users',
		});

		// validar que tenga los campos requeridos
		if (
			typeof decoded === 'object' &&
			'userId' in decoded &&
			'email' in decoded &&
			'role' in decoded
		) {
			return decoded as JwtPayload;
		}
		throw new Error('Invalid token payload');


	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			throw createAppError('Token has expired', 401, true, { code: 'TOKEN_EXPIRED' });
		}

		if (error instanceof jwt.JsonWebTokenError) {
			throw createAppError('Invalid token', 401, true, { code: 'INVALID_TOKEN' });
		}

		throw createAppError('Token verification failed', 401);
	}
};

/**
 * Extraer token del header Authorization
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
	if (!authHeader) {
		return null;
	}

	// formato esperado "Bearer <token>"
	const parts = authHeader.split(' ');

	if (parts.length !== 2 || parts[ 0 ] !== 'Bearer' || !parts[ 1 ]) {
		return null;
	}

	return parts[ 1 ];
};

/**
 * Decodificar token sin verificar (para debugging)
 */
export const decodeToken = (token: string): JwtPayload | null => {
	try {
		const decoded = jwt.decode(token);

		if (typeof decoded === 'object' &&
			decoded !== null &&
			'userId' in decoded
		) {
			return decoded as JwtPayload;
		}
		return null;
	} catch {
		return null;
	}
};
