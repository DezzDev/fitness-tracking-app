import { userService } from './../../../services/user.service';
import { userRepository } from './../../../repositories/user.repository';
import bcrypt from "bcrypt";
import { createMockUser } from './../../../test-utils/helpers';
import { validateRegisterData, validateLoginData } from './../../../test-utils/fixtures';
import { describe, it, expect, jest } from '@jest/globals';
import { beforeEach, mock } from 'node:test';

// Simulamos la librería 'uuid' ANTES de importarla
jest.mock('uuid', () => ({
	v4: jest.fn(() => 'mocked-uuid-1234'),
}));

// mock de dependencias
jest.mock('./../../../repositories/user.repository');
jest.mock("bcrypt");

const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('User Service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('register', () => {

		it('should throw error if email already exists', async () => {
			mockUserRepository.existByEmail.mockResolvedValue(true);

			await expect(userService.register(validateRegisterData)).rejects.toThrow(
				'Email already registered'
			);

			expect(mockBcrypt.hash).not.toHaveBeenCalled();
			expect(mockUserRepository.create).not.toHaveBeenCalled();
		})

		it('should register a new user successfully', async () => {
			const mockUser = createMockUser({ email: validateRegisterData.email });

			mockUserRepository.existByEmail.mockResolvedValue(false);
			mockBcrypt.hash.mockResolvedValue('hashed-password' as never);
			mockUserRepository.create.mockResolvedValue(mockUser);

			const result = await userService.register(validateRegisterData);

			expect(result).toHaveProperty('user');
			expect(result).toHaveProperty('token');
			expect(result.user.email).toBe(validateRegisterData.email);
			expect(mockUserRepository.existByEmail).toHaveBeenCalledWith(validateRegisterData.email);
			expect(mockBcrypt.hash).toHaveBeenCalled();
			expect(mockUserRepository.create).toHaveBeenCalled();
		});

	})

	describe('login', () => {
		it('should login user with valid credentials', async () => {
			const mockUser = createMockUser({ email: validateLoginData.email });
			const mockUserWithPassword = {
				...mockUser,
				passwordHash: 'hashed-password'
			};

			mockUserRepository.findByEmailWithPassword.mockResolvedValue(mockUserWithPassword);
			mockBcrypt.compare.mockResolvedValue(true as never);

			const result = await userService.login(validateLoginData);

			expect(result).toHaveProperty('user');
			expect(result).toHaveProperty('token');
			expect(result.user.email).toBe(validateLoginData.email);
			expect(result.user).not.toHaveProperty('passwordHash');
		});

		it('should throw error if password is incorrect', async () => {
			const mockUser = createMockUser();
			const mockUserWithPassword = {
				...mockUser,
				passwordHash: 'hashed-password'
			};

			mockUserRepository.findByEmailWithPassword.mockResolvedValue(mockUserWithPassword);
			mockBcrypt.compare.mockResolvedValue(false as never);

			await expect(userService.login(validateLoginData)).rejects.toThrow('Invalid credentials');
		});
	});

	describe('findById', () => {
		it('should find user by id', async () => {
			const mockUser = createMockUser();

			mockUserRepository.findById.mockResolvedValue(mockUser);

			const result = await userService.findById(mockUser.id);

			expect(result).toMatchObject(mockUser);
			expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.id);
		});

		it('should throw error if user not found', async () => {
			mockUserRepository.findById.mockResolvedValue(null);
			await expect(userService.findById('non-existent-id')).rejects.toThrow('User not found')
		});
	});

	describe('update', () => {
		it('should update user successfully', async () => {
			const mockUser = createMockUser();
			const updateData = {name:'Updated Name', age: 30};
			const updatedUser = {...mockUser, ...updateData};

			mockUserRepository.findById.mockResolvedValue(mockUser);
			mockUserRepository.update.mockResolvedValue(updatedUser);

			const result = await userService.update(mockUser.id, updateData);

			expect(result).toMatchObject(updatedUser);
			expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.id);
			expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, updateData);
		});

		it('should throw error if user not found', async ()=>{
			mockUserRepository.findById.mockResolvedValue(null);
			await expect(userService.update('non-existent-id', {name:'Updated Name'})).rejects.toThrow('User not found')
		});

		it('should throw error if email already in use', async()=>{
			const mockUser = createMockUser();
			const newEmail = 'newemail@example.com';

			mockUserRepository.findById.mockResolvedValue(mockUser);
			mockUserRepository.existByEmail.mockResolvedValue(true);

			await expect (userService.update(mockUser.id, {email:newEmail})).rejects.toThrow('Email already in use');
			expect(mockUserRepository.existByEmail).toHaveBeenCalledWith(newEmail);
		});
	});

	describe('soft delete',()=>{
		it('should delete user successfully', async()=>{
			const mockUser = createMockUser();

			mockUserRepository.findById.mockResolvedValue(mockUser);
			mockUserRepository.softDelete.mockResolvedValue();

			await userService.softDelete(mockUser.id);

			expect(mockUserRepository.softDelete).toHaveBeenCalledWith(mockUser.id);
		});

		it('should throw error if user not found', async ()=>{
			mockUserRepository.findById.mockResolvedValue(null);
			await expect(userService.softDelete('non-existent-id')).rejects.toThrow('User not found')
		});
	});
});

