// user.service

// todos los errores que se lanzan desde servicios deben de ser appErrors

import bcrypt from 'bcrypt';
import { User } from '@/types';
import { LoginInput, RegisterInput, UpdateUserInput } from '@/schemas/user.schema';
import { userRepository } from '@/repositories/user.repository';
import { createAppError } from '@/middlewares/error.middleware';
import { handleServiceError } from '@/utils/error.utils';
import { authService } from './auth.service';
import { securityEventRepository } from '@/repositories/securityEvent.repository';
import { getDataUriSize, isValidDataUri, processImageToBase64 } from '@/utils/image.utils';



// ============================================
// CONSTANTES
// ============================================

const SALT_ROUNDS = 10;
const MAX_PROFILE_IMAGE_SIZE_BYTES = 1024 * 1024;

// ============================================
// FUNCIONES PURAS: Utilidades
// ============================================

const hashPassword = async (password: string): Promise<string> =>
  bcrypt.hash(password, SALT_ROUNDS);

const comparePassword = async (password: string, hash: string): Promise<boolean> =>
  bcrypt.compare(password, hash);

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
  register: async (input: RegisterInput): Promise<{ user: User; accessToken: string }> => {
    try {
      // 1. Verificar si el email ya existe
      const existingUser = await userRepository.existByEmail(input.email);

      if (existingUser) {
        throw createAppError('Email already registered', 409);
      }

      // 2. Hashear contraseña
      const passwordHash = await hashPassword(input.password);

      // 3. Crear usuario
      const user = await userRepository.create(input, passwordHash);

      // 4. Generar token
      const {accessToken} = await authService.generateTokenPair({ userId: user.id, role: user.role, tokenVersion: user.tokenVersion || 0 });

      // 5. Retornar usuario sanitizado y token
      return {
        user: sanitizeUser(user),
        accessToken
      };
    } catch (error) {
      // se utiliza handleServiceError para manejar errores que provienen del repository u otros
      // ademas hacer un log y convertir errores conocidos o desconocidos en AppErrors
      throw handleServiceError(
        error,
        'UserService.register',
        'Unable to register user',
        { email: input.email }
      );
    }
  },

  /**
   * Login
   * INPUT: LoginInput (schema)
   * OUTPUT: User (entity)
   */
  login: async (input: LoginInput): Promise<{
        user: User;
        tokens: { accessToken: string; refreshToken: string, tokenId: string }
      }> => {
    try {
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
      // Generar tokens
      const tokens = await authService.generateTokenPair({
        userId: user.id,
        role: user.role,
        tokenVersion: user.tokenVersion || 0,
      })

      // Registrar evento de login exitoso
      await securityEventRepository.create({
        userId: user.id,
        eventType: 'login',
        tokenId: tokens.tokenId,      
        success: true,
        details: 'User logged in successfully'
      })

      return {
        user: sanitizeUser(user),
        tokens: tokens
      }

    } catch (error) {
      throw handleServiceError(
        error,
        'UserService.login',
        'Unable to login',
        { email: input.email }
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
      // validación básica
      if (page < 1) page = 1;
      if (limit < 1 || limit > 100) limit = 10;

      // Obtener usuarios y total
      const [users, total] = await Promise.all([
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
  update: async (id: string, input: UpdateUserInput): Promise<User> => {
    try {
      // 1. Verifica que el usuario existe
      const existingUser = await userRepository.findById(id);

      if (!existingUser) {
        throw createAppError('User not found', 404);
      }

      // 2. si se actualiza email verifica que no existe
      if (input.email && input.email !== existingUser.email) {
        const emailExists = await userRepository.existByEmail(input.email);

        if (emailExists) {
          throw createAppError('Email already in use', 409);
        }
      }

      // 3. Actualizar
      const updateUser = await userRepository.update(id, input);
      return sanitizeUser(updateUser);
    } catch (error) {
      throw handleServiceError(
        error,
        'UserService.update',
        'Unable to update user',
        { userId: id, input }
      );
    }
  },

  updateProfileImage: async (userId: string, imageBuffer: Buffer): Promise<User> => {
    try {
      const existingUser = await userRepository.findById(userId);

      if (!existingUser) {
        throw createAppError('User not found', 404);
      }

      const base64Image = await processImageToBase64(imageBuffer, {
        maxWidth: 500,
        maxHeight: 500,
        quality: 85,
      });

      if (!isValidDataUri(base64Image)) {
        throw createAppError('Invalid image format', 400);
      }

      const imageSize = getDataUriSize(base64Image);

      if (imageSize > MAX_PROFILE_IMAGE_SIZE_BYTES) {
        throw createAppError(
          `Processed image too large (${(imageSize / 1024 / 1024).toFixed(2)}MB). Max 1MB`,
          400
        );
      }

      const updatedUser = await userRepository.update(userId, {
        profileImage: base64Image,
      });

      return sanitizeUser(updatedUser);
    } catch (error) {
      throw handleServiceError(
        error,
        'UserService.updateProfileImage',
        'Unable to update profile image',
        { userId }
      );
    }
  },

  deleteProfileImage: async (userId: string): Promise<User> => {
    try {
      const existingUser = await userRepository.findById(userId);

      if (!existingUser) {
        throw createAppError('User not found', 404);
      }

      if (!existingUser.profileImage) {
        throw createAppError('User has no profile image', 400);
      }

      const updatedUser = await userRepository.update(userId, {
        profileImage: null,
      });

      return sanitizeUser(updatedUser);
    } catch (error) {
      throw handleServiceError(
        error,
        'UserService.deleteProfileImage',
        'Unable to delete profile image',
        { userId }
      );
    }
  },

  /**
  * Eliminar usuario (lógica: desactivar)
  */
  softDelete: async (id: string): Promise<void> => {
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
      await userRepository.hardDelete(id);
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
  },

  /**
   * Eliminar todos los usuarios de prueba
   */
  deleteMockUsers: async (): Promise<void> => {
    try {
      await userRepository.deleteMockUsers();
    } catch (error) {
      throw handleServiceError(
        error,
        'UserService.deleteMockUsers',
        'Unable to delete mock users',
      );
    }
  },


};
