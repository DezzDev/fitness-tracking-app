// src/__tests__/integration/users.test.ts

import request from "supertest";
import express, { Application, response } from "express";
import userRoutes from "../../routes/user.routes";
import { errorHandler, notFoundHandler } from "../../middlewares/error.middleware";
import {	
	generateTokenTest, 
	createMockUser, 
	createMockAdmin, 
	clearTestDatabase, 
	wait, 
	mockedRandomId
} from "../../test-utils/helpers";
import {validateRegisterData} from "./../../test-utils/fixtures";
import {describe, jest, it, beforeAll, expect, beforeEach, afterAll} from "@jest/globals";
import { v4 as uuidv4 } from 'uuid';
import { connectDatabase } from "../../config/database";
import { RegisterInput } from "../../schemas/user.schema";
import { email } from "zod";


// Simulamos la librería 'uuid' ANTES de importarla
jest.mock('uuid', () => ({
	v4: jest.fn(),
}));

 
const createTestApp = async(): Promise<Application> =>{
	const app = express();
	app.use(express.json());
	app.use('/api/users', userRoutes);
	app.use(notFoundHandler);
	app.use(errorHandler);
	await connectDatabase();
	return app;
};

describe('Users API Integration Tests', ()=>{
	let app: Application;
	let userToken: string;
	let adminToken: string;
	let userId: string;
	let userRegularEmail: string;
	let userAdminEmail: string;

	beforeAll(async()=>{
		app = await createTestApp();

		// creamos uuid aleatorio para el id del usuario
		(uuidv4 as jest.Mock).mockImplementation(() => `${mockedRandomId()}`)
		
		// registramos un usuario regular
		userRegularEmail = `mocked-${mockedRandomId()}@example.com`;
		const userResponse = await request(app)
			.post('/api/users/register')
			.send({
				...validateRegisterData,
				email: userRegularEmail,
			})

		// obtenemos el token del usuario
		userToken = userResponse.body.data.token;
		userId = userResponse.body.data.user.id;

		// creamos un usuario admin
		userAdminEmail = `mocked-${mockedRandomId()}@example.com`;
		const adminResponse = await request(app)
			.post('/api/users/register')
			.send({
				...validateRegisterData,
				email: userAdminEmail,
				role: 'admin'
			})

			// obtenemos token del usuario admin
			adminToken = adminResponse.body.data.token;
	});

	afterAll(async () => {
			await wait(2000)
			await clearTestDatabase();
		})

	describe('GET /api/users/me', ()=>{
		it('should get authenticated user profile', async ()=>{
			const response = await request(app)
				.get('/api/users/me')
				.set('Authorization', `Bearer ${userToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('email');
			expect(response.body.data).not.toHaveProperty('password');
		})

		it('should return 401 without token', async ()=>{
			await request(app).get('/api/users/me').expect(401);
		})

		it('should return 401 with invalid token', async ()=>{
			await request(app)
				.get('/api/users/me')
				.set('Authorization', `Bearer invalid-token`)
				.expect(401);
		});
	});

	describe('GET /api/users',()=>{
		it('should list users for admin', async ()=>{
			const response = await request(app)
				.get('/api/users')
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(200);
			
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('users');
			expect(response.body.data).toHaveProperty('total');
			expect(response.body.data).toHaveProperty('page');
			expect(response.body.data).toHaveProperty('totalPages');
			expect(Array.isArray(response.body.data.users)).toBe(true);
		});

		it('should return 403 for non-admin user', async ()=>{
			const response = await request(app)
				.get('/api/users')
				.set('Authorization', `Bearer ${userToken}`)
				.expect(403);

			expect(response.body.success).toBe(false);
			expect(response.body.error).toContain('Insufficient permissions to access this resource');
		});

		it('should support pagination', async ()=>{
			const response = await request(app)
				.get('/api/users?page=1&limit=5')
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.page).toBe(1);
			expect(response.body.data.users.length).toBeLessThanOrEqual(5);
		});

		it('should return 401 without token', async ()=>{
			await request(app).get('/api/users').expect(401);
		});

	});

	describe('GET /api/users/:id', ()=>{
		it('should get user by id for admin', async ()=>{
			const response = await request(app)
				.get(`/api/users/${userId}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('id', userId);
			expect(response.body.data).toHaveProperty('email');
			expect(response.body.data).not.toHaveProperty('password');
		});

		it('should return 403 for non-admin', async ()=>{
			await request(app)
				.get(`/api/users/${userId}`)
				.set('Authorization', `Bearer ${userToken}`)
				.expect(403);
		});

		it('should return 404 for non-existent user', async()=>{
			const fakeId = mockedRandomId();
			const response = await request(app)
				.get(`/api/users/${fakeId}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(404);
			
			expect(response.body.error).toBe('User not found');
		});

		it('should return 400 for invalid UUID format', async()=>{
			await request(app)
				.get(`/api/users/invalid-format-token`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(400);
		})

	})

	describe('PATCH /api/users/:id', ()=>{
		it('should update user for user', async ()=>{
			const updateData = {
				name: 'Updated Name',
				age: 30,
			};

			const response = await request(app)
				.patch(`/api/users/${userId}`)
				.set('Authorization', `Bearer ${userToken}`)
				.send(updateData)
				.expect(200);
			
			expect(response.body).toHaveProperty('success', true);
			expect(response.body.data).toHaveProperty('name', updateData.name);
			expect(response.body.data).toHaveProperty('age', updateData.age);
		})

		it('should return 400 for invalid data', async ()=>{
			await request(app)
				.patch(`/api/users/${userId}`)
				.set('Authorization', `Bearer ${userToken}`)
				.send({age:10}) // Menor de 15
				.expect(400);
		})

		it('should return 404 for non-existent user', async ()=>{
			const fakeId = mockedRandomId();
			await request(app)
				.patch(`/api/users/${fakeId}`)
				.set('Authorization', `Bearer ${userToken}`)
				.send({name:`test`}) // Menor de 15
				.expect(404);
		})

		it('should reject unknown fields when strict', async ()=>{
			const response = await request(app)
				.patch(`/api/users/${userId}`)
				.set('Authorization', `Bearer ${userToken}`)
				.send({name:`test`, unknownField:`test`}) // Menor de 15
				.expect(400);

			expect(response.body.error).toBe('Validation failed');
		})
	})

	describe('DELETE /api/users/softDelete/:id', ()=>{
		let userToDeleteId: string;
		beforeEach(async ()=>{
			// creamos un usuario para borrar
			const newEmail = `mocked-${mockedRandomId()}@example.com`;
			const response = await request(app)
				.post('/api/users/register')
				.send({
					...validateRegisterData,
					email: newEmail
				})
				.expect(201);
			
			userToDeleteId = response.body.data.user.id;
		});

		it('should soft delete user for admin',async()=>{
			await request(app)
				.delete(`/api/users/softDelete/${userToDeleteId}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(204);

			
			await request(app)
				.get(`/api/users/${userToDeleteId}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(404);
			
		})

		it('should hard delete user for admin',async()=>{
			await request(app)
				.delete(`/api/users/hardDelete/${userToDeleteId}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(204);

			await request(app)
				.get(`/api/users/${userToDeleteId}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(404);
		})

		it('should return 403 for non-admin user',async()=>{
			await request(app)
				.delete(`/api/users/softDelete/${userToDeleteId}`)
				.set('Authorization', `Bearer ${userToken}`)
				.expect(403);
		})
	
		it('should return 404 for non-existent user', async ()=>{
			const fakeId = mockedRandomId();

			await request(app)
				.delete(`/api/users/softDelete/${fakeId}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(404);
		})

	})

	describe('PATCH /api/users/me/password', ()=>{
		it('should change password for authenticated user', async()=>{
			const response = await request(app)
				.patch(`/api/users/me/password`)
				.set('Authorization', `Bearer ${userToken}`)
				.send({oldPassword: validateRegisterData.password, newPassword: 'NewPassword123'})
				.expect(200);

			expect(response.body).toHaveProperty('success', true);
			expect(response.body.message).toContain('Password changed successfully');

			// verificar que se puede hacer login con el nuevo password
			const loginResponse = await request(app)
				.post('/api/users/login')
				.send({
					email: userRegularEmail,
					password: 'NewPassword123'
				})
				.expect(200);

			expect(loginResponse.body).toHaveProperty('success', true);
			expect(loginResponse.body.data).toHaveProperty('token');
		})

		it('should return 401 for incorrect old password', async ()=>{
			const response = await request(app)
				.patch(`/api/users/me/password`)
				.set('Authorization', `Bearer ${userToken}`)
				.send({oldPassword: 'WrongPassword123', newPassword: 'NewPassword123'})
				.expect(401);
			
			expect(response.body.error).toContain('Current password is incorrect')
		});

		it('should return 400 for invalid new password', async()=>{
			await request(app)
				.patch(`/api/users/me/password`)
				.set('Authorization', `Bearer ${userToken}`)
				.send({
					oldPassword: validateRegisterData.password, 
					newPassword: 'weak' // No cumple requisitos
				})
				.expect(400);
		})

		it('should return 401 without token', async()=>{
			await request(app)
				.patch(`/api/users/me/password`)
				.send({
					oldPassword: validateRegisterData.password, 
					newPassword: 'NewPassword123'
				})
				.expect(401);
		})
	})

	

})