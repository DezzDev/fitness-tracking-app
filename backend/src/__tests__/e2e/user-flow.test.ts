import request from 'supertest';
import express, { Application } from 'express';
import userRoutes from '../../routes/user.routes';
import { errorHandler, notFoundHandler } from '../../middlewares/error.middleware';
import { mockedRandomId, wait } from '../../test-utils/helpers';
import { validateRegisterData } from '../../test-utils/fixtures';
import { connectDatabase } from "../../config/database";
import { v4 as uuidv4 } from 'uuid';

// Simulamos la librería 'uuid' ANTES de importarla
jest.mock('uuid', () => ({
	v4: jest.fn(),
}));

const createTestApp = async (): Promise<Application> => {
	const app = express();
	app.use(express.json());
	app.use('/api/users', userRoutes);
	app.use(notFoundHandler);
	app.use(errorHandler);
	await connectDatabase();
	return app;
}

describe('User Flow E2E Tests', () => {
	let app: Application;

	beforeAll(async () => {
		app = await createTestApp();
		// creamos uuid aleatorio para el id del usuario
		(uuidv4 as jest.Mock).mockImplementation(() => `${mockedRandomId()}`)
	})

	it('should complete full user lifecycle', async () => {
		const timestamp = Date.now();
		const userData = {
			...validateRegisterData,
			email: `mocked-${mockedRandomId()}@example.com`,
		}

		// ============================================
		// 1. REGISTRO
		// ============================================
		console.log('1. Register user...')
		const registerResponse = await request(app)
			.post('/api/users/register')
			.send(userData)
			.expect(201);
		
		expect(registerResponse.body.success).toBe(true);
		const {token:registerToken, user} = registerResponse.body.data;
		expect(registerToken).toBeDefined();
		expect(user.email).toBe(userData.email);
		const userId = user.id;

		// ============================================
		// 2. LOGIN
		// ============================================	
		console.log('2. Logging in...')
		const loginResponse = await request(app)
			.post('/api/users/login')
			.send({
				email: userData.email,
				password: userData.password
			})
			.expect(200);

		expect(loginResponse.body.success).toBe(true);
		const {token:loginToken} = loginResponse.body.data;
		expect(loginToken).toBeDefined();
		expect(loginToken).not.toEqual(registerToken); // token diferente

		// ============================================
		// 3. OBTENER PERFIL
		// ============================================
		console.log('3. Getting profile...')
		const profileResponse = await request(app)
			.get(`/api/users/me`)
			.set('Authorization', `Bearer ${loginToken}`)
			.expect(200);

		expect(profileResponse.body.data.email).toBe(userData.email);
		expect(profileResponse.body.data.name).toBe(userData.name);

		// ============================================
		// 4. ACTUALIZAR PERFIL
		// ============================================
		console.log('4. Updating profile...')

		const updateData = {
			name: 'Updated e2e user',
			age: 26
		}

		const updateResponse = await request(app)
			.patch(`/api/users/${userId}`)
			.set('Authorization', `Bearer ${loginToken}`)
			.send(updateData)
			.expect(200);
		
		expect(updateResponse.body.success).toBe(true);
		expect(updateResponse.body.data.name).toBe(updateData.name);
		expect(updateResponse.body.data.age).toBe(updateData.age);

	})

})