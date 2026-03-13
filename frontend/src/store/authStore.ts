// src/store/authStore.ts
import { create } from 'zustand';
import type { User } from '@/types';
import { authApi } from '@/api/endpoints/auth';
import type { AxiosError } from 'axios';

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;

	// Actions
	login: (email: string, password: string) => Promise<void>;
	register: (data: { 
		email: string, 
		password: string, 
		name: string, 
		age: number, 
		acceptTerms: boolean, 
		role?: ('user' | 'admin'),
		profile_image?:string 
	}) => Promise<void>;
	logout: () => void;
	loadUser: () => void;
	clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: authApi.getCurrentUser(),
	isAuthenticated: authApi.isAuthenticated(),
	isLoading: false,
	error: null,

	/**
	 * Iniciar sesión
	 */
	login: async (email: string, password: string) => {
		set({ isLoading: true, error: null });

		try {
			const { user } = await authApi.login({ email, password });

			set({
				user,
				isAuthenticated: true,
				isLoading: false,
			});

		} catch (error: unknown) {
			let errorMessage = 'Error al iniciar sesión';
			if (error && typeof error === 'object' && 'response' in error) {
				const axiosError = error as AxiosError;
				errorMessage = (axiosError.response?.data as { message?: string })?.message || errorMessage;
			}
			set({
				error: errorMessage,
				isLoading: false
			});
			throw error;
		}
	},

	/**
	 * Registrar nuevo usuario
	 */
	register: async (data) => {
		set({ isLoading: true, error: null });
		try {
			await authApi.register(data);

			// Después de registrar, hacer login automáticamente
			await authApi.login({ email: data.email, password: data.password });

			const user = authApi.getCurrentUser();

			set({
				user,
				isAuthenticated: true,
				isLoading: false,
			})
		} catch (error: unknown) {
			let errorMessage = 'Error al registrar usuario';
			if (error && typeof error === 'object' && 'response' in error) {
				const axiosError = error as AxiosError;
				errorMessage = (axiosError.response?.data as { message?: string })?.message || errorMessage;
			}
			set({
				error: errorMessage,
				isLoading: false
			});
			throw error;
		}
	},

	/**
	 * Cerrar sesión
	 */
	logout: () => {
		authApi.logout();

		set({
			user: null,
			isAuthenticated: false,
			error: null
		})
	},

	/**
	 * Cargar usuario desde localStorage
	 */
	loadUser: () => {
		const user = authApi.getCurrentUser();
		const isAuthenticated = authApi.isAuthenticated();

		set({
			user,
			isAuthenticated,
		})
	},

	/**
	 * Limpiar errores
	 */
	clearError: () => {
		set({ error: null });
	}


}))
