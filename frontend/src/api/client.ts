// src/api/client.ts

import type { RefreshTokenResponse } from '@/types';
import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { set } from 'zod';

// Configuración base
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

// Crear instancia de Axios
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Para enviar cookies
})

// Estado de refresh
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

// Procesar cola de request pendientes
const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  failedQueue = [];
}

// Obtener access token desde localStorage
const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken')
}

// Guardar access token en localStorage
export const setAccessToken = (token: string) => {
  localStorage.setItem('accessToken', token);
}

// Limpiar acessToken de localStorage
export const clearAccessToken = () => {
  localStorage.removeItem('accessToken');
}


// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

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
    const originalRequest = error.config;

    // Solo cerrar sesión en 401 si es un error de autenticación
    // No cerrar sesión si es un error de validación (contraseña incorrecta, etc)
    if (error.response?.status === 401 && originalRequest) {

      // Rutas que no deben cerrar sesión automáticamente en 401
      const noLogoutRoutes = [
        '/users/me/password',
        '/users/login',
        '/users/register',
        '/user/forgot-password',
        '/user/reset-password',
      ];

      const shouldNotLogout = noLogoutRoutes.some(route =>
        originalRequest.url?.includes(route)
      );

      // Solo cerrar sesión si no es una de las rutas excluidas
      if (!shouldNotLogout) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

//  Interceptador para manejar refresco de token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // caso 1: token expirado (401 + TOKEN_EXPIRED)

    if (error.response?.status === 401 &&
      (error.response?.data as any)?.error === 'TOKEN_EXPIRED' &&
      originalRequest &&
      !originalRequest._retry) {

      // Si ya estamos refrescando el token, agregar esta request a la cola
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // LLamada al endpoint de refresh 
        const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh');

        const newAccessToken = response.data.data!.accessToken;

        // Guardar nuevo token en localStorage
        setAccessToken(newAccessToken);

        // Procesar cola de requests pendientes
        processQueue(null, newAccessToken);

        // Reintentar request original con nuevo token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);

      } catch (refreshError) {
        // si el refresh falla, limpiar todo y redirigir a login
        processQueue(refreshError, null);

        clearAccessToken();
        localStorage.removeItem('user');

        // Redirigir a login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // caso 2: token reuse detectado
    
    if(error.response?.status === 401 &&
      (error.response?.data as any)?.error === 'TOKEN_REUSE_DETECTED'
    )

    return Promise.reject(error);
  }
)

// Tipos para respuestas estandarizadas
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
  success?: boolean;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: {
    items: T[]
    total: number
    page: number
    totalPages: number
  }
  timestamp: string
}

// Helper para manejar errores de API
export const handleApiError = (error: unknown, messageManual: string = 'Error desconocido'): string => {
  if (axios.isAxiosError(error)) {
    console.log({ error })
    return error.response?.data?.error || error.message || messageManual;
  }
  return 'Error de conexión';
}


