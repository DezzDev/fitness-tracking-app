// user.service

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RegisterInput, LoginInput } from '@/schemas/user.schema';
import { User, UserCreateData, UserUpdateData } from '@/types';
import { userRepository } from '@/repository/user.repository';
import { createAppError } from '@/middlewares/error.middleware';
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
	 * Registrar usuario
	 * INPUT: RegisterInput (schema con validaciones)
	 * OUTPUT: User (entity del dominio)
	 */
	register: async (input: RegisterInput): Promise<{ user: User; token: string }> => {
		// 1. Verificar si el email ya existe
		const existingUser = await userRepository.existByEmail(input.email);

		if (existingUser) {
			throw createAppError('Email already registered', 409);
		}

		// 2. Convertir schema -> entity type
		const createData: UserCreateData = {
			email: input.email,
			password: input.password,
			name: input.name,
			age: input.age,
			role: input.role,
			profile_image: input.profile_image,
			// acceptTerms no se pasa (solo se valida)
		};

		// 3. Hashear contraseña
		const passwordHash = await hashPassword(createData.password);

		// 4. Crear usuario en DB
		// obtenemos entity type
		const user: User = await userRepository.create(createData, passwordHash);

		// 5. Generar token
		const token = generateToken(user.id, user.email, user.role);

		// 6. Retornar usuario sanitizado y token
		return {
			user: sanitizeUser(user),
			token
		};
	},

	/**
	 * Login
	 * INPUT: LoginInput (schema)
	 * OUTPUT: User (entity)
	 */
	login: async (input:LoginInput): Promise<{ user: User; token: string }> => {
		// 1. Buscar usuarios por email, obtener sus datos y su password_hash
		const user = await userRepository.findByEmailWithPassword(input.email);

		if (!user) {
			throw createAppError('Invalid credentials', 401);
		}

		// 2.Verificar password
		const isPasswordValid = await comparePassword(input.password, user.passwordHash);

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
	},

	/**
	 * Obtener usuario por ID
	 */
	findById: async (id: string): Promise<User> => {

		const user = await userRepository.findById(id);

		if (!user) {
			throw createAppError('User not found', 404);
		}

		return sanitizeUser(user);
	},

	/**
	* Obtener usuario por email
	*/
	findByEmail: async (email: string): Promise<User> => {
		const user = await userRepository.findByEmail(email);

		if (!user) {
			throw createAppError('User not found', 404);
		}
		return sanitizeUser(user);
	},

	/**
	 * Listar usuarios con pagination
	 */
	findAll: async (
		page = 1,
		limit = 10
	): Promise<{ users: User[], total: number; page: number; totalPages: number }> => {
		// validación básica
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
	},

	/**
	 * Actualizar usuario
	 */
	update: async (id: string, data: UserUpdateData): Promise<User> => {
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
	},

	/**
	* Eliminar usuario
	*/
	delete: async (id: string): Promise<void> => {
		// 1. Verificar que existe
		const user = await userRepository.findById(id);

		if (!user) {
			throw createAppError('User not found', 404);
		}

		// 2. Eliminar
		await userRepository.delete(id);
	},

	/**
	 * Cambiar contraseña
	 */
	changePassword: async (
		id: string,
		oldPassword: string,
		newPassword: string
	): Promise<void> => {
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
	}


};