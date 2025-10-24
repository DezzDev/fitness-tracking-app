// src/__tests__/unit/utils/jwt.utils.test.ts

import { generateToken, verifyToken, extractTokenFromHeader, decodeToken } from './../../../utils/jwt.utils';
import { createAppError } from './../../../middlewares/error.middleware';
import { describe, it, expect } from '@jest/globals';

describe('JWT Utils', () => {
	describe('generateToken', () => {
		it('should generate a valid JWT token', () => {
			const payload = {
				userId: 'test-id',
				email: 'test@example.com',
				role: 'user' as const,
			};

			const token = generateToken(payload);
			expect(token).toBeDefined();
			expect(typeof token).toBe("string");
			expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
		});

		it('should include payload data in token', () => {
			const payload = {
				userId: 'test-id',
				email: 'test@example.com',
				role: 'user' as const,
			};

			const token = generateToken(payload);
			const decoded = verifyToken(token);

			expect(decoded.userId).toBe(payload.userId);
			expect(decoded.email).toBe(payload.email);
			expect(decoded.role).toBe(payload.role);
		});
	});

	describe('verifyToken', () => {
		it('should verify and decode valid token', () => {
			const payload = {
				userId: 'test-id',
				email: 'test@example.com',
				role: 'user' as const,
			};

			const token = generateToken(payload);
			const decoded = verifyToken(token);

			expect(decoded).toMatchObject(payload)
		});

		it('should throw error for invalid token', () => {
			const invalidToken = 'invalid.token.here';
			expect(() => verifyToken(invalidToken)).toThrow()
		});


		it('should throw error for expired token', () => {
			// Mock de token expirado
			const expiredToken = generateToken(
				{ userId: 'test', email: 'test@example.com', role: 'user' },
				{ expiresIn: '-1s' } // Expirado hace 1 segundo
			);

			// Esperar 1 segundo
			return new Promise((resolve) => {
				setTimeout(() => {
					expect(() => verifyToken(expiredToken)).toThrow('Token expired');
					resolve(undefined);
				}, 1100);
			});
		});
	});

	describe('extractTokenFromHeader', () => {
		it('should extract token from valid Bearer header', () => {
			const token = 'my-token-123';
			const header = `Bearer ${token}`;

			const extracted = extractTokenFromHeader(header);

			expect(extracted).toBe(token);
		});

		it('should return null for missing header', () => {
			const extracted = extractTokenFromHeader(undefined);

			expect(extracted).toBeNull();
		});

		it('should return null for invalid format', () => {
			expect(extractTokenFromHeader('InvalidFormat')).toBeNull();
			expect(extractTokenFromHeader('Bearer')).toBeNull();
			expect(extractTokenFromHeader('Bearer token extra')).toBeNull();
		});
	});
})