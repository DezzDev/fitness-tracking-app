// src/__tests__/integration/users.test.ts

import request from "supertest";
import express, { Application } from "express";
import userRoutes from "../../routes/user.routes";
import { errorHandler, notFoundHandler } from "../../middlewares/error.middleware";
import {generateTokenTest, createMockUser, createMockAdmin} from "../../test-utils/helpers";
import {validateRegisterData} from "./../../test-utils/fixtures";
import {describe, jest, it, beforeAll, expect} from "@jest/globals";
import { v4 as uuidv4 } from 'uuid';
import { connectDatabase } from "../../config/database";

// Simulamos la librería 'uuid' ANTES de importarla
jest.mock('uuid', () => ({
	v4: jest.fn(),
}));

// Genera un id aleatorio simple
// 1e9 es una notación científica para 1*10^9 o 1 000 000 000
const randomId = () => `${Math.floor(Math.random() * 1e9)}`;

 
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

	beforeAll(async()=>{
		app = await createTestApp();

		// creamos uuid aleatorio para el id del usuario
		(uuidv4 as jest.Mock).mockImplementation(() => `mocked-${randomId()}`)
		
		// registramos un usuario regular
		const userRegularEmail = `mocked-${randomId()}@example.com`;
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
		const userAdminEmail = `mocked-${randomId()}@example.com`;
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

	

})