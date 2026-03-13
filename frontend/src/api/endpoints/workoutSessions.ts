import type { CreateWorkoutSessionData, WorkoutSession, WorkoutSessionWithExercises, SessionFilters, WorkoutSessionStats, WorkoutSessionWithMetrics } from "@/types";
import { apiClient, type ApiResponse, type PaginatedResponse } from "../client";

// Tipo específico para crear sesión desde template
export interface CreateSessionFromTemplateData {
	templateId: string;
	sessionDate: Date;
	notes?: string;
	durationMinutes?: number;
}

interface SessionsListResponse  {
	success: boolean
	message: string
	data: {
		sessions: WorkoutSessionWithMetrics[]
		total: number
		page: number
		totalPages: number
	}
	timestamp: string
}

export const workoutSessionsApi = {
	/**
	 * Listar sesiones con filtros
	 */
	listSessions: async (filters?: SessionFilters): Promise<PaginatedResponse<WorkoutSessionWithMetrics>> => {
		const params = new URLSearchParams();

		if (filters?.page) params.append('page', filters.page.toString());
		if (filters?.limit) params.append('limit', filters.limit.toString());
		if (filters?.startDate) params.append('startDate', filters.startDate);
		if (filters?.endDate) params.append('endDate', filters.endDate);
		if (filters?.templateId) params.append('templateId', filters.templateId);
		if (filters?.searchTerm) params.append('searchTerm', filters.searchTerm);

		const response = await apiClient.get<SessionsListResponse>(`/workoutSessions?${params.toString()}`);

		const { success, message, data, timestamp } = response.data;

		return {
			success,
			message,
			timestamp,
			data: {
				items: data.sessions,
				total: data.total,
				page: data.page,
				totalPages: data.totalPages
			}
		};

	},

	/**
	 * Obtener sesión por ID (retorna con exercises y sets)
	 */
	getSession: async (id: string): Promise<WorkoutSessionWithExercises> => {
		const response = await apiClient.get<ApiResponse<WorkoutSessionWithExercises>>(
			`/workoutSessions/${id}`
		)
		return response.data.data!;
	},

	/**
	 * Obtener sesiones recientes
	 */
	getRecentSessions: async (limit: number = 5): Promise<WorkoutSession[]> => {
		const response = await apiClient.get<ApiResponse<WorkoutSession[]>>(
			`/workoutSessions/recent?limit=${limit}`
		);
		return response.data.data!;
	},

	/**
	 * Obtener estadísticas de sesiones
	 */
	getSessionStats: async (): Promise<WorkoutSessionStats> => {
		const response = await apiClient.get<ApiResponse<WorkoutSessionStats>>(
			'/workoutSessions/stats'
		);
		return response.data.data!;
	},

	/**
	 * Obtener sesiones por rango de fechas
	 */
	getSessionsByDateRange: async (startDate: Date, endDate: Date): Promise<WorkoutSession[]> => {
		const params = new URLSearchParams({
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString()
		});
		const response = await apiClient.get<ApiResponse<WorkoutSession[]>>(
			`/workoutSessions/date-range?${params.toString()}`
		);
		return response.data.data!;
	},

	/**
	 * Crear nueva sesión desde template
	 */
	createSessionFromTemplate: async (
		data: CreateSessionFromTemplateData
	): Promise<WorkoutSessionWithExercises> => {
		const response = await apiClient.post<ApiResponse<WorkoutSessionWithExercises>>(
			'/workoutSessions/from-template',
			data
		)
		return response.data.data!;
	},

	/**
	 * Crear sesión libre (sin template)
	 */
	createSession: async (data: CreateWorkoutSessionData): Promise<WorkoutSession> => {
		const response = await apiClient.post<ApiResponse<WorkoutSession>>(
			'/workoutSessions',
			data
		)
		return response.data.data!;
	},

	/**
	 * Actualizar sesión
	 */
	updateSession: async (
		id: string,
		data: Partial<CreateWorkoutSessionData>
	): Promise<WorkoutSession> => {
		const response = await apiClient.patch<ApiResponse<WorkoutSession>>(
			`/workoutSessions/${id}`,
			data
		)
		return response.data.data!;
	},

	/**
	 * Eliminar sesión
	 */
	deleteSession: async (id: string): Promise<void> => {
		await apiClient.delete(`/workoutSessions/${id}`);
	}

}