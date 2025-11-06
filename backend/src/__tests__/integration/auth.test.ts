// src/__tests__/integration/auth.test.ts

import request from 'supertest';
import express, { Application } from 'express';
import userRoutes from '../../routes/user.routes';
import { errorHandler, notFoundHandler } from '../../middlewares/error.middleware';
import { validateLoginData, validateRegisterData, invalidRegisterData } from '../../test-utils/fixtures';
import { beforeAll, jest, it, describe, expect } from '@jest/globals';
import { connectDatabase } from '../../config/database';


const randomId = () => {
	let id: string = "";
	for (let i = 0; i < 10; i++) {
		id = id + Math.floor(Math.random() * 9).toString();
	}
	return id;
}
const mockedId = `mocked-${randomId()}`;

// Simulamos la librería 'uuid' ANTES de importarla
jest.mock('uuid', () => ({
	v4: jest.fn(() => mockedId),
}));

// setup de la app para testing

const createTestApp = async (): Promise<Application> => {
	const app = express();
	app.use(express.json());
	app.use('/api/users', userRoutes);
	app.use(notFoundHandler);
	app.use(errorHandler);
	await connectDatabase();
	return app;
}


describe('authentication integration tests', () => {
	let app: Application;

	beforeAll(async () => {
		app = await createTestApp();
	})

	describe('POST /api/users/register', () => {
		it('should register a new user with valid data', async () => {
		
			const newEmail = `mocked-${randomId()}@example.com`;
			
			const response = await request(app)
				.post('/api/users/register')
				.send({
					...validateRegisterData, 
					email: newEmail,
				})
				.expect(201);

			
			expect(response.body).toHaveProperty('success', true);
			expect(response.body.data).toHaveProperty('token');
			expect(response.body.data).toHaveProperty('user');
			expect(response.body.data.user.email).toBe(newEmail);
			expect(response.body.data.user).not.toHaveProperty('password');
	});

	it('should return 400 for missing email', async ()=>{
		const response = await request(app)
			.post('/api/users/register')
			.send(invalidRegisterData.emailMissing)
			.expect(400);

		expect(response.body).toHaveProperty('success', false);
		expect(response.body).toHaveProperty('error');
	});

	it('should return 400 for invalid email format', async()=>{
		const response = await request(app)
			.post('/api/users/register')
			.send(invalidRegisterData.emailInvalid)
			.expect(400);

		expect(response.body).toHaveProperty('success', false);
		console.log(response)
		expect(response.body.details.message).toContain('Invalid email address');
	})

})
})