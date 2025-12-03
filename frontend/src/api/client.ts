import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

// Configuración base
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

// Crear instancia de Axios
export const apiClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: 10000, // 10 segundos
	headers: {
		'Content-Type': 'application/json',
	}
})

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = localStorage.getItem('authToken');

		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error: AxiosError) => {
		return Promise.reject(error);
	}
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		//  Si el token expiró, redirigir al login
		if (error.response?.status === 401) {
			localStorage.removeItem('authToken');
			localStorage.removeItem('user');
			window.location.href = '/login';
		}
		return Promise.reject(error);
	}
);

// Tipos para respuestas estandarizadas
export interface ApiResponse<T =unknown>{
	data?: T;
	message?: string;
	error?: string;
}

export interface PaginatedResponse<T>{
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

// Helper para manejar errores de API
export const handleApiError = (error: unknown): string => {
	if(axios.isAxiosError(error)){
		return error.response?.data?.message || error.message || 'Error desconocido';
	}
	return 'Error de conexión';
}


