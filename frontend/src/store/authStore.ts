// src/store/authStore.ts
import { create } from 'zustand';
import type { RegisterData, User } from '@/types';
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
	loginDemo: () => Promise<void>;
	register: (data: RegisterData) => Promise<void>;
	logout: () => Promise<void>;
  	logoutAll: () => Promise<void>;
	loadUser: () => void;
	hydrateUserFromServer: () => Promise<void>;
	syncUserFromStorage: () => void;
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
	 * Iniciar sesion demo
	 */
	loginDemo: async () => {
		set({ isLoading: true, error: null });

		try {
			const { user } = await authApi.loginDemo();

			set({
				user,
				isAuthenticated: true,
				isLoading: false,
				accessToken: getAccessToken()
			});
		} catch (error: unknown) {
			let errorMessage = 'Error al iniciar demo';
			if (error && typeof error === 'object' && 'response' in error) {
				const axiosError = error as AxiosError;
				errorMessage =
					(axiosError.response?.data as { message?: string })?.message || errorMessage;
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
	register: async (data: RegisterData) => {
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
	 * Revalidar usuario contra backend (para sincronizar profileImage cross-device)
	 * Si falla 401, limpia sesion completamente.
	 */
	hydrateUserFromServer: async () => {
		const token = getAccessToken();
		if (!token) return;

		try {
			const user = await authApi.getProfile();

			set({
				user,
				isAuthenticated: true,
			});
		} catch (error: unknown) {
			const axiosError = error as AxiosError;
			if (axiosError.response?.status === 401) {
				set({
					user: null,
					isAuthenticated: false,
					accessToken: null,
				});
				localStorage.removeItem('accessToken');
				localStorage.removeItem('user');
			}
		}
	},

	/**
	 * Sincronizar usuario desde localStorage (para cross-tab)
	 */
	syncUserFromStorage: () => {
		const user = authApi.getCurrentUser();
		const isAuthenticated = authApi.isAuthenticated();

		set({
			user,
			isAuthenticated,
		});
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
