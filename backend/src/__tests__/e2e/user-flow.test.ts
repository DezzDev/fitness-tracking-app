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
		const newPassword = 'NewPassword123';
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
		const { token: registerToken, user } = registerResponse.body.data;
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
		const { token: loginToken } = loginResponse.body.data;
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

		// ============================================
		// 5. CAMBIAR CONTRASEÑA
		// ============================================
		console.log('5. Changing password...')
		const passwordChangeResponse = await request(app)
			.patch('/api/users/me/password')
			.set('Authorization', `Bearer ${loginToken}`)
			.send({
				oldPassword: userData.password,
				newPassword: newPassword
			})
			.expect(200);

		expect(passwordChangeResponse.body.success).toBe(true);

		// Verificar que la antigua contraseña ya no funciona
		await request(app)
			.post('/api/users/login')
			.send({
				email: userData.email,
				password: userData.password,
			})
			.expect(401);

		// Verificar que la nueva contraseña funciona
		const newLoginResponse = await request(app)
			.post('/api/users/login')
			.send({
				email: userData.email,
				password: newPassword
			})
			.expect(200);

		expect(newLoginResponse.body.success).toBe(true);
		expect(newLoginResponse.body.data.token).toBeDefined();

		// ============================================
		// 6. LISTAR TODOS LOS USUARIOS (como admin)
		// ============================================
		console.log('6. Listing users as admin...')

		// Registrar un nuevo usuario como admin
		const adminData = {
			...validateRegisterData,
			email: `mocked-${mockedRandomId()}@example.com`,
			role: 'admin'
		}

		const adminRegisterResponse = await request(app)
			.post('/api/users/register')
			.send(adminData)
			.expect(201);

		expect(adminRegisterResponse.body.success).toBe(true);
		const { token: adminRegisterToken } = adminRegisterResponse.body.data;
		expect(adminRegisterToken).toBeDefined();

		// Listar todos los usuarios
		const listResponse = await request(app)
			.get('/api/users')
			.set('Authorization', `Bearer ${adminRegisterToken}`)
			.expect(200);

		expect(listResponse.body.data.users.length).toBeGreaterThan(0);
		expect(listResponse.body.data.total).toBeGreaterThan(0);

		// ============================================
		// 7. ELIMINAR USUARIO
		// ============================================
		console.log('7. Deleting user...')

		await request(app)
			.delete(`/api/users/softDelete/${userId}`)
			.set('Authorization', `Bearer ${adminRegisterToken}`)
			.expect(204);

		// verificar que el usuario se ha eliminado
		await request(app)
			.get(`/api/users/${userId}`)
			.set('Authorization', `Bearer ${adminRegisterToken}`)
			.expect(404);
		
		// verificar que el usuario no puede hacer login
		await request(app)
			.post('/api/users/login')
			.send({
				email: userData.email,
				password: newPassword,
			})
			.expect(401);

		console.log('✅ Full user lifecycle completed successfully')

	});

	it('should handle concurrent user operations', async ()=>{

		// crear multiple usuarios concurrentes
		const userPromises = Array.from({length: 5},(_, i)=>{
			return request(app)
				.post('/api/users/register')
				.send({
					...validateRegisterData,
					email: `mocked-${mockedRandomId()}@example.com`,
					name: `User ${i}`,
				})
		})

		const responses = await Promise.all(userPromises);

		// verificar que todos se crearon exitosamente
		responses.forEach((response,i)=>{
			expect(response.status).toBe(201);
			expect(response.body.data.user.name).toBe(`User ${i}`);
		})

	})

	it('should handle error scenarios gracefully', async ()=>{
		// Escenario 1: Registrar usuario con email duplicado
		const userData = {
			...validateRegisterData,
			email: `mocked-${mockedRandomId()}@example.com`,
		}

		await request(app)
			.post('/api/users/register')
			.send(userData)
			.expect(201);
		
		await request(app)
			.post('/api/users/register')
			.send(userData)
			.expect(409);

		// Escenario 2: Login con credenciales incorrectas 
		await request(app)
			.post('/api/users/login')
			.send({
				email: 'wrong@email.com',
				password: 'WrownPassword123'
			})
			.expect(401);

		// Escenario 3: Acceso sin autenticación
		await request(app)
			.get('/api/users/me')
			.expect(401);
		
		// Escenario 4: Acceso a un recurso sin autorización (user intenta listar todos los usuarios)
		const loginResponse = await request(app)
			.post('/api/users/login')
			.send({
				email: userData.email,
				password: userData.password
			})

			const userToken = loginResponse.body.data.token;

			await request(app)
				.get('/api/users')
				.set('Authorization', `Bearer ${userToken}`)
				.expect(403);
	})
});