// src/__tests__/integration/auth.test.ts

import request from 'supertest';
import express, { Application } from 'express';
import userRoutes from '../../routes/user.routes';
import { errorHandler, notFoundHandler } from '../../middlewares/error.middleware';
import { validateLoginData, validateRegisterData, invalidRegisterData } from '../../test-utils/fixtures';
import { beforeAll, jest, it, describe, expect, beforeEach, afterAll } from '@jest/globals';
import { connectDatabase } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';
import { clearTestDatabase, mockedRandomId, wait } from "../../test-utils/helpers";


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

// Simulamos la librería 'uuid' ANTES de importarla
jest.mock('uuid', () => ({
	v4: jest.fn(),
}));


describe('authentication integration tests', () => {
	let app: Application;

	beforeAll(async () => {
		app = await createTestApp();
		// creamos uuid aleatorio para el id del usuario
		(uuidv4 as jest.Mock).mockImplementation(() => `${mockedRandomId()}`)
	})


	describe('POST /api/users/register', () => {


		it('should register a new user with valid data', async () => {

			const newEmail = `mocked-${mockedRandomId()}@example.com`;

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

		it('should return 400 for missing email', async () => {
			const response = await request(app)
				.post('/api/users/register')
				.send(invalidRegisterData.emailMissing)
				.expect(400);

			expect(response.body).toHaveProperty('success', false);
			expect(response.body).toHaveProperty('error');
		});

		it('should return 400 for invalid email format', async () => {
			const response = await request(app)
				.post('/api/users/register')
				.send(invalidRegisterData.emailInvalid)
				.expect(400);

			expect(response.body).toHaveProperty('success', false);
			const messages = response.body.details.map((d: any) => d.message);
			expect(messages).toContainEqual(expect.stringContaining('Invalid email address'));

		});

		it('should return 400 for short password', async () => {
			const response = await request(app)
				.post('/api/users/register')
				.send(invalidRegisterData.passwordShort)
				.expect(400);

			const messages = response.body.details.map((m: any) => m.message);
			expect(messages).toContainEqual(expect.stringContaining('Password must be at least 8 characters long'));
		})

		it('should return 400 for password without uppercase', async () => {
			const response = await request(app)
				.post('/api/users/register')
				.send(invalidRegisterData.passwordNoUppercase)
				.expect(400);

			const messages = response.body.details.map((m: any) => m.message);
			expect(messages).toContainEqual(expect.stringContaining('Password must contain at least one uppercase letter'));
		})

		it('should return 400 for password without lowercase', async () => {
			const response = await request(app)
				.post('/api/users/register')
				.send(invalidRegisterData.passwordNoLowercase)
				.expect(400);

			const messages = response.body.details.map((m: any) => m.message);
			expect(messages).toContainEqual(expect.stringContaining('Password must contain at least one lowercase letter'));
		})

		it('should return 400 too young for register', async () => {
			const response = await request(app)
				.post('/api/users/register')
				.send(invalidRegisterData.areYoung)
				.expect(400);

			const messages = response.body.details.map((m: any) => m.message);
			expect(messages).toContainEqual(expect.stringContaining('Age must be at least 15 years old'));
		})

		it('should return 400 for terms not accepted', async () => {
			const response = await request(app)
				.post('/api/users/register')
				.send(invalidRegisterData.termsNotAccepted)
				.expect(400);

			const messages = response.body.details.map((m: any) => m.message);
			expect(messages).toContainEqual(expect.stringContaining('You must accept the terms and conditions'));
		})

		it('should return 409 if email already exists', async () => {
			const newEmail = `mocked-${mockedRandomId()}@example.com`;
			// primer registro
			const response = await request(app)
				.post('/api/users/register')
				.send({
					...validateRegisterData,
					email: newEmail
				})
				.expect(201);

			// segundo registro con el mismo email
			const response2 = await request(app)
				.post('/api/users/register')
				.send({
					...validateRegisterData,
					email: newEmail
				})
				.expect(409);

			expect(response2.body.error).toBe('Email already registered');
		});
	});

	describe('POST /api/users/login', () => {
		// creamos un email aleatorio para los tests
		const newEmail = `mocked-${mockedRandomId()}@example.com`;

		it('should login with valid credentials', async () => {


			// registramos un usuario
			await request(app).post('/api/users/register').send({
				...validateRegisterData,
				email: newEmail,
			})

			// login
			const response = await request(app)
				.post('/api/users/login')
				.send({
					email: newEmail,
					password: validateLoginData.password
				})
				.expect(200);

			expect(response.body).toHaveProperty('success', true);
			expect(response.body.data).toHaveProperty('user');
			expect(response.body.data).toHaveProperty('token');
			expect(response.body.data.user.email).toBe(newEmail);
			expect(response.body.data.user).not.toHaveProperty('password');
			expect(typeof response.body.data.token).toBe("string");
		});

		it('should return 401 for invalid email', async () => {
			const response = await request(app)
				.post('/api/users/login')
				.send({
					email: 'wrong@email.com',
					password: validateLoginData.password
				})
				.expect(401);

			expect(response.body.error).toContain('Invalid credentials');
		});

		it('should return 401 for invalid password', async () => {
			const response = await request(app)
				.post('/api/users/login')
				.send({
					email: newEmail,
					password: 'WrongPassword123'
				})
				.expect(401);

			expect(response.body.error).toContain('Invalid credentials');
		});

		it('should return 400 for missing credentials', async () => {
			await request(app).post('/api/users/login').send({}).expect(400);
		});

	})
})