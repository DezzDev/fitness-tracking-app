// src/api/endpoints/auth.ts

import {apiClient, type ApiResponse} from "@/api/client";
import type{ LoginCredentials, RegisterData, AuthResponse, User } from "@/types";

export const authApi = {
	/**
	 * Registrar nuevo usuario
	 * @param data Datos del usuario a registrar
	 * @returns datos del usuario registrado
	 */
	register: async (data: RegisterData): Promise<User> =>{
		const response = await apiClient.post<ApiResponse<User>>(
			'/users/register',
			data
		);
		return response.data.data!;
	},

	/**
	 * Login
	 * @param credentials Credenciales de login (email y password)
	 * @returns datos de autenticación (token y usuario)
	 */
	login: async (credentials: LoginCredentials): Promise<AuthResponse> =>{
		const response = await apiClient.post<ApiResponse<AuthResponse>>(
			'/users/login',
			credentials
		);

		const authData = response.data.data!;

		// Guardar token y usuario en localStorage
		localStorage.setItem('accessToken', authData.accessToken);
		localStorage.setItem('user', JSON.stringify(authData.user))

		return authData;
	},

	/**
	 * Cerrar sesión
	 */
	logout: () =>{
		localStorage.removeItem('accessToken');
		localStorage.removeItem('user');
	},

	/**
	 * Obtener perfil del usuario actual
	 * @returns datos del usuario actual 
	 */
	getProfile: async (): Promise<User> => {
		const response= await apiClient.get<ApiResponse<User>>(
			'/users/me'
		);
		return response.data.data!;
	},

	/**
	 * Cambiar contraseña
	 * @param data Datos para cambiar la contraseña (currentPassword, newPassword)
	 * @returns void
	 */
	changePassword: async(data:{
		currentPassword: string;
		newPassword: string;
	}): Promise<void> => {
		await apiClient.patch('/users/me/password', data);
	},

	/**
	 * Verificar si hay un usuario autenticado
	 * @returns true si hay un token de autenticación en localStorage
	 */
	isAuthenticated: (): boolean => {
		return !!localStorage.getItem('accessToken');
	},

	/**
	 * Obtener usuario desde localStorage
	 * @returns usuario o null si no hay usuario en localStorage
	 */
	getCurrentUser: (): User | null => {
		const userStr = localStorage.getItem('user');
		return userStr ? JSON.parse(userStr) as User : null
	}

}
