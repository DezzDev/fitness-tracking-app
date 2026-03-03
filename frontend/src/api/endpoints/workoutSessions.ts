import type { CreateWorkoutSessionData, WorkoutSession, WorkoutSessionWithExercises, SessionFilters } from "@/types";
import { apiClient, type ApiResponse, type PaginatedResponse } from "../client";

// Tipo específico para crear sesión desde template
export interface CreateSessionFromTemplateData {
	templateId: string;
	sessionDate: Date;
	notes?: string;
	durationMinutes?: number;
}

export const workoutSessionsApi = {
	/**
	 * Listar sesiones con filtros
	 */
	listSessions: async (filters?: SessionFilters): Promise<PaginatedResponse<WorkoutSession>> =>{
		const params = new URLSearchParams();

		if (filters?.page) params.append('page', filters.page.toString());
		if (filters?.limit) params.append('limit', filters.limit.toString());
		if (filters?.startDate) params.append('startDate', filters.startDate);
		if (filters?.endDate) params.append('endDate', filters.endDate);
		if (filters?.templateId) params.append('templateId', filters.templateId);
		if (filters?.searchTerm) params.append('searchTerm', filters.searchTerm);

		const response = await apiClient.get<PaginatedResponse<WorkoutSession>>(`/workoutSessions?${params.toString()}`);

		return response.data;
	},

	/**
	 * Obtener sesión por ID (retorna con exercises y sets)
	 */
	getSession: async (id: string): Promise<WorkoutSessionWithExercises> =>{
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
	getSessionStats: async (): Promise<any> => {
		const response = await apiClient.get<ApiResponse<any>>(
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
	createSession: async (data: CreateWorkoutSessionData):Promise<WorkoutSession> => {
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
		id:string,
		data: Partial<CreateWorkoutSessionData>		
	):Promise<WorkoutSession> => {
		const response = await apiClient.patch<ApiResponse<WorkoutSession>>(
			`/workoutSessions/${id}`,
			data
		)
		return response.data.data!;
	},

	/**
	 * Eliminar sesión
	 */
	deleteSession: async (id:string):Promise<void> => {
		await apiClient.delete(`/workoutSessions/${id}`);
	}

}