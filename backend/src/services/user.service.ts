// user.service

// todos los errores que se lanzan desde servicios deben de ser appErrors

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, UserCreateData, UserUpdateData } from '@/types';
import { userRepository } from '@/repository/user.repository';
import { createAppError } from '@/middlewares/error.middleware';
import { handleServiceError } from '@/utils/error.utils';
import { env } from '@/config/env';



// ============================================
// CONSTANTES
// ============================================

const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = '7d';

// ============================================
// FUNCIONES PURAS: Utilidades
// ============================================

const hashPassword = async (password: string): Promise<string> =>
	bcrypt.hash(password, SALT_ROUNDS);

const comparePassword = async (password: string, hash: string): Promise<boolean> =>
	bcrypt.compare(password, hash);

const generateToken = (userId: string, email: string, role: string): string =>
	jwt.sign(
		{ userId, email, role },
		env.JWT_SECRET,
		{ expiresIn: JWT_EXPIRES_IN }
	);

const sanitizeUser = (user: User): Omit<User, 'passwordHash'> => {
	// Remover campos sensibles si los hubiera
	return user;
};

// ============================================
// SERVICE: Lógica de negocio
// ============================================

export const userService = {
	/**
		* Registrar un nuevo usuario
	*/
	register: async (data: UserCreateData): Promise<{ user: User; token: string }> => {
		try {
			// 1. Verificar si el email ya existe
			const existingUser = await userRepository.existByEmail(data.email);

			if (existingUser) {
				throw createAppError('Email already registered', 409);
			}

			// 2. Hashear contraseña
			const passwordHash = await hashPassword(data.password);

			// 3. Crear usuario
			const user = await userRepository.create(data, passwordHash);

			// 4. Generar token
			const token = generateToken(user.id, user.email, user.role);

			// 5. Retornar usuario sanitizado y token
			return {
				user: sanitizeUser(user),
				token
			};
		} catch (error) {
			// se utiliza handleServiceError para manejar errores que provienen del repository u otros
			// ademas de convertir errores desconocidos en AppErrors
			throw handleServiceError(
				error,
				'UserService.register',
				'Unable to register user',
				{ email: data.email }
			);
		}
	},

	/**
	 * Login
	 * INPUT: LoginInput (schema)
	 * OUTPUT: User (entity)
	 */
	login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
		try {
			// 1. Buscar usuarios por email, obtener sus datos y su password_hash
			const user = await userRepository.findByEmailWithPassword(email);

			if (!user) {
				throw createAppError('Invalid credentials', 401);
			}

			// 2.Verificar password
			const isPasswordValid = await comparePassword(password, user.passwordHash);

			if (!isPasswordValid) {
				throw createAppError('Invalid credentials', 401);
			}

			// 3. Generar token
			const token = generateToken(user.id, user.email, user.role);


			// Retornar usuario sanitizado (sin password)		
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { passwordHash, ...userWithoutPassword } = user;

			return {
				user: userWithoutPassword,
				token
			};
		} catch (error) {
			throw handleServiceError(
				error,
				'UserService.login',
				'Unable to login',
				{ email }
			);
		}
	},

	/**
	 * Obtener usuario por ID
	 */
	findById: async (id: string): Promise<User> => {
		try {
			const user = await userRepository.findById(id);

			if (!user) {
				throw createAppError('User not found', 404);
			}

			return sanitizeUser(user);
		} catch (error) {
			throw handleServiceError(
				error,
				'UserService.findById',
				'Unable to retrieve user',
				{ userId: id }
			);
		}
	},

	/**
	* Obtener usuario por email
	*/
	findByEmail: async (email: string): Promise<User> => {
		try {
			const user = await userRepository.findByEmail(email);

			if (!user) {
				throw createAppError('User not found', 404);
			}
			return sanitizeUser(user);
		} catch (error) {
			throw handleServiceError(
				error,
				'UserService.findByEmail',
				'Unable to retrieve user',
				{ email }
			);
		}
	},

	/**
	 * Listar usuarios con pagination
	 */
	findAll: async (
		page = 1,
		limit = 10
	): Promise<{ users: User[], total: number; page: number; totalPages: number }> => {
		try {
			// validación basica
			if (page < 1) page = 1;
			if (limit < 1 || limit > 100) limit = 10;

			// Obtener usuarios y total
			const [ users, total ] = await Promise.all([
				userRepository.findAll(page, limit),
				userRepository.count()
			]);

			const totalPages = Math.ceil(total / limit);

			return {
				users: users.map(sanitizeUser),
				total,
				page,
				totalPages
			};
		} catch (error) {
			throw handleServiceError(
				error,
				'UserService.findAll',
				'Unable to retrieve users',
				{ page, limit }
			);
		}
	},

	/**
	 * Actualizar usuario
	 */
	update: async (id: string, data: UserUpdateData): Promise<User> => {
		try {
			// 1. Verifica que el usuario existe
			const existingUser = await userRepository.findById(id);

			if (!existingUser) {
				throw createAppError('User not found', 404);
			}

			// 2. si se actualiza email verifica que no existe
			if (data.email && data.email !== existingUser.email) {
				const emailExists = await userRepository.existByEmail(data.email);

				if (emailExists) {
					throw createAppError('Email already in use', 409);
				}
			}

			// 3. Actualizar
			const updateUser = await userRepository.update(id, data);
			return sanitizeUser(updateUser);
		} catch (error) {
			throw handleServiceError(
				error,
				'UserService.update',
				'Unable to update user',
				{ userId: id, data }
			);
		}
	},

	/**
	* Eliminar usuario (lógica: desactivar)
	*/
	delete: async (id: string): Promise<void> => {
		try {
			// 1. Verificar que existe
			const user = await userRepository.findById(id);

			if (!user) {
				throw createAppError('User not found', 404);
			}

			// 2. Eliminar
			await userRepository.softDelete(id);
			
		} catch (error) {
			throw handleServiceError(
				error,
				'UserService.delete',
				'Unable to delete user',
				{ userId: id }
			);
		}
	},

	/**
	* Eliminar usuario permanentemente
	*/

	hardDelete: async (id: string): Promise<void> => {
		try {
			// 1. Verificar que existe
			const user = await userRepository.findById(id);

			if (!user) {
				throw createAppError('User not found', 404);
			}

			// 2. Eliminar
			await userRepository.delete(id);
		} catch (error) {
			throw handleServiceError(
				error,
				'UserService.delete',
				'Unable to delete user',
				{ userId: id }
			);
		}
	},

	/**
	 * Cambiar contraseña
	 */
	changePassword: async (
		id: string,
		oldPassword: string,
		newPassword: string
	): Promise<void> => {
		try {
			// 1. Obtener usuario con password
			const user = await userRepository.findById(id);

			if (!user) {
				throw createAppError('User not found', 404);
			}

			const userWithPassword = await userRepository.findByEmailWithPassword(user.email);

			if (!userWithPassword) {
				throw createAppError('User not found', 404);
			}

			// 2. Verificar contraseña actual
			const isPasswordValid = await comparePassword(oldPassword, userWithPassword.passwordHash);

			if (!isPasswordValid) {
				throw createAppError('Current password is incorrect', 401);
			}

			// 3. Hashear nueva contraseña
			const newPasswordHash = await hashPassword(newPassword);

			// 4. Actualizar
			await userRepository.updatePassword(id, newPasswordHash);
		} catch (error) {
			
			throw handleServiceError(
				error,
				'UserService.changePassword',
				'Unable to change password',
				{ userId: id }
			);
		}
	}


};