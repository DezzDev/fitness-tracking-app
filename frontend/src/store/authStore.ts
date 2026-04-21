// src/store/authStore.ts
import { create } from 'zustand';
import type { User } from '@/types';
import { authApi } from '@/api/endpoints/auth';
import { clearWorkoutStorage } from '@/lib/workoutStorage';
import type { AxiosError } from 'axios';
import { getAccessToken, setAccessToken } from '@/api/client';

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
  accessToken: string | null;

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
	logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
	loadUser: () => void;
	clearError: () => void;
  setAccessToken: (token: string) => void; 
}

export const useAuthStore = create<AuthState>((set) => ({
	user: authApi.getCurrentUser(),
	isAuthenticated: authApi.isAuthenticated(),
	isLoading: false,
	error: null,
  accessToken: null,

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
				accessToken : getAccessToken()
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
				accessToken: getAccessToken()
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
	logout: async () => {

    try{
      // llamar backend para revocar refresh token
      await authApi.logout();

    }catch(error){
      console.error("Logout error: ", error);
    }finally{
      // Clear active workout sessions
      clearWorkoutStorage();
  
      set({
        user: null,
        isAuthenticated: false,
        error: null,
        accessToken: null,
      })

    }
		
	},

  /**
   * Cerrar sesión en todas las sesiones
   */
  logoutAll: async () => {
    
    try{
      await authApi.logoutAll();
    }catch(error){
      console.error("Logout all error:", error);
    }finally{
      clearWorkoutStorage();

      set({
        user: null,
        isAuthenticated: false,
        error: null,
        accessToken: null
      })
    }
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
	},

  /**
   * Actualizar access token (llamado por interceptor)
   */
  setAccessToken: (token: string) => {
    // actualizar token en el estado
    set({ accessToken: token })
    // actualiza token en localStorage
    setAccessToken(token);
  },


}))
