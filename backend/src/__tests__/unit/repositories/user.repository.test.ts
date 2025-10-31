// src/__tests__/unit/repositories/user.repository.test.ts

import { userRepository } from './../../../repositories/user.repository';
import { execute, executeWithRetry } from './../../../config/database';
import { createMockUser } from './../../../test-utils/helpers';
import { describe, it, expect, jest } from '@jest/globals';
import { UserCreateData } from './../../../types';
import { beforeEach } from 'node:test';
import { create } from 'domain';

// Mock de las funciones de database
jest.mock('@/config/database');

const mockExecute = execute as jest.MockedFunction<typeof execute>;
const mockExecuteWithRetry = executeWithRetry as jest.MockedFunction<typeof executeWithRetry>;

describe('User Repository', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('create', () => {

		it('should create a new user', async () => {

			const createData: UserCreateData = {
				email: 'test@example.com',
				password: 'password123',
				name: 'Test User',
				age: 25,
				role: 'user',
				profile_image: "http://example.com/image.jpg",
			};

			const mockUser = createMockUser(createData);

			mockExecuteWithRetry.mockImplementation((fn: any) =>
				fn({
					execute: jest.fn().mockResolvedValue({
						rows: [
							{
								id: mockUser.id,
								email: mockUser.email,
								name: mockUser.name,
								age: mockUser.age,
								role: mockUser.role,
								profile_image: mockUser.profile_image,
								is_active: mockUser.is_active,
								created_at: mockUser.createdAt.toISOString(),
								updated_at: mockUser.updatedAt.toISOString(),
							},
						],
					} as never), // he puesto as never para que no me salte el error de typescript
				})
			);

			const result = await userRepository.create(createData, 'hashed-password');

			expect(result).toMatchObject({
				email: createData.email,
				name: createData.name,
				age: createData.age,
				role: createData.role,
			});
			expect(mockExecuteWithRetry).toHaveBeenCalledWith(1);
		});

		it('should throw error if creation fails', async () => {
			const createData: UserCreateData = {
				email: 'test@example.com',
				password: 'password123',
				name: 'Test User',
				age: 25,
				role: 'user',
				profile_image: "http://example.com/image.jpg",
			};

			mockExecuteWithRetry.mockImplementation((fn: any) =>
				fn({
					execute: jest.fn().mockResolvedValue({
						rows: [], // sin resultados
					} as never)
				})
			);

			await expect(
				userRepository.create(createData, 'hashed-password')
			).rejects.toThrow('Failed to create user');
		});
	});

	describe('findById', () => {
		it('should find user by id', async () => {
			const mockUser = createMockUser();

			mockExecute.mockResolvedValue({
				rows: [
					{
						id: mockUser.id,
						email: mockUser.email,
						name: mockUser.name,
						age: mockUser.age,
						role: mockUser.role,
						profile_image: mockUser.profile_image,
						is_active: mockUser.is_active,
						created_at: mockUser.createdAt.toISOString(),
						updated_at: mockUser.updatedAt.toISOString(),
					},
				]
			} as never);

			const result = await userRepository.findById(mockUser.id);

			expect(result).toMatchObject({
				id: mockUser.id,
				email: mockUser.email,
			});
			expect(mockExecute).toHaveBeenCalledWith({
				sql: expect.stringContaining('SELECT * FROM users WHERE id = ?'),
				args: [ mockUser.id ]
			});
		});

		it('should return null if user not found', async () => {
			mockExecute.mockResolvedValue({
				rows: [],
			} as never);

			const result = await userRepository.findById('non-existent-id');

			expect(result).toBeNull();
		});
	});


	describe('existByEmail', () => {
		it('should return true if email exists', async () => {
			const mockUser = createMockUser();

			mockExecute.mockResolvedValue({
				rows: [ mockUser ]
			} as never);

			const result = await userRepository.existByEmail(mockUser.email);
			expect(result).toBe(true);
		});

		it('should return false if email does not exist', async () => {
			mockExecute.mockResolvedValue({
				rows: [],
			} as never)

			const result = await userRepository.existByEmail('nonexistent@example.com');

			expect(result).toBe(false)
		});
	});

	describe('count', ()=>{
		it('should return total count of users', async()=>{
			mockExecute.mockResolvedValue({
				rows:[{total: 42}]
			} as never);

			const result = await userRepository.count();

			expect(result).toBe(42);
		});

		it('should throw error if count return no results', async()=>{
			mockExecute.mockResolvedValue({
				row:[]
			} as never);

			await expect(userRepository.count()).rejects.toThrow();
		});

		it('should throw error if count returns invalid type', async ()=>{
			mockExecute.mockResolvedValue({
				rows:[{total: 'not-a-number'}]
			} as never);

			await expect(userRepository.count()).rejects.toThrow();
		});
	});
});