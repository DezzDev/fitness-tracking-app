import {userService} from './../../../services/user.service';
import {userRepository} from './../../../repositories/user.repository';
import bcrypt from "bcrypt";
import {createMockUser} from './../../../test-utils/helpers';
import {validateRegisterData, validateLoginData} from './../../../test-utils/fixtures';
import {describe, it, expect, jest} from '@jest/globals';
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

describe('User Service', ()=>{
	beforeEach(()=>{
		jest.clearAllMocks();
	});

	describe('register', ()=>{
		it('should register a new user successfully', async ()=>{
			const mockUser = createMockUser({email: validateRegisterData.email});

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

		it('should throw error if email already exists', async () => {
			mockUserRepository.existByEmail.mockResolvedValue(true);

			await expect(userService.register(validateRegisterData)).rejects.toThrow(
				'Email already registered'
			);

			expect(mockBcrypt.hash).not.toHaveBeenCalled();
			expect(mockUserRepository.create).not.toHaveBeenCalled();
		})

	})

})