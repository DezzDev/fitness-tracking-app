// src/api/endpoints/auth.ts

import {apiClient, type ApiResponse, setAccessToken, clearAccessToken, getAccessToken} from "@/api/client";
import type{ LoginCredentials, RegisterData, AuthResponse, User, RefreshTokenResponse } from "@/types";
import type { ChangePasswordData } from "./users";

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
		setAccessToken(authData.accessToken);
		localStorage.setItem('user', JSON.stringify(authData.user))

		return authData;
	},

  /**
   * Refresh tokens
   * Renovar access token usando refresh token almacenado en cookies
   */

  refresh: async (): Promise<string> => {
    const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>(
      '/auth/refresh'
    );

    const newAccessToken = response.data.data!.accessToken;

    // guardar nuevo access token en localStorage
    setAccessToken(newAccessToken);

    return newAccessToken;
  },

	/**
	 * Cerrar sesión
	 */
	logout: async ():Promise<void> =>{
    try{
      // llamar backend para revocar refresh token
      await apiClient.post('/users/logout');
    }catch(error){
      // aunque falle, limpiar localmente
      console.error("Logout error:", error);
    }finally {
      // Limpiar localStorage
      clearAccessToken();
      localStorage.removeItem('user');
    }
	},

  /**
   * Cerrar sesión en todos los dispositivos
   */
  logoutAll: async ():Promise<void> =>{
    try{
      await apiClient.post('auth/logout-all');
    }catch(error){
      console.error('Logout all error: ',error );
    }finally{
      // Limpiar localStorage
      clearAccessToken();
      localStorage.removeItem('user');
    }
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
	changePassword: async(data: ChangePasswordData): Promise<void> => {
		await apiClient.patch('/users/me/password', data);

    // limpiar token local
    clearAccessToken();
    localStorage.removeItem('user');
	},

	/**
	 * Verificar si hay un usuario autenticado
	 * @returns true si hay un token de autenticación en localStorage
	 */
	  isAuthenticated: (): boolean => {
    const token = getAccessToken();
    const user = localStorage.getItem('user');
    return !!(token && user);
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
