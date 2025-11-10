// src/test-utils/helpers

import jwt from 'jsonwebtoken';
import {User} from '@/types';
import {env} from '@/config/env';
import { userService } from '@/services/user.service';

/**
 * Generar token JWT para testing
 */
export const generateTokenTest = (user:Partial<User>): string =>{
	return jwt.sign(
		{
			userId: user.id ?? 'test-user-id',
			email: user.email ?? 'test@example.com',
			role: user.role ?? 'user'
		},
		env.JWT_SECRET,
		{expiresIn: '1h'}
	);
};

/**
 * Crear usuario mock
*/
export const createMockUser = (overrides?: Partial<User>): User =>({
	id: 'test-user-id',
	email: 'test@example.com',
	name: 'Test User',
	age: 25,
	role: 'user',
	profile_image: 'http://localhost:3000/public/images/default-avatar.jpg',
	is_active: true,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
});

/**
 * Crear admin mock
 */
export const createMockAdmin = (overrides?: Partial<User>): User =>
	createMockUser({role:'admin', ...overrides})

/**
 * Esperar X milisegundos (para tests de timeout)
 */
export const wait = (ms:number):Promise<void> =>
	new Promise(resolve => setTimeout(resolve,ms));

/**
 * Limpiar base de datos de test
 */
export const clearTestDatabase = async (): Promise<void> => {
	await userService.deleteMockUsers();
};

// Genera un id aleatorio simple
export const mockedRandomId = (): string => {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
		const r = Math.random() * 16 | 0;
		const v = c === 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

