import type { CreateWorkoutSessionData, WorkoutSession } from "@/types";
import { apiClient, type ApiResponse, type PaginatedResponse } from "../client";

export interface SessionFilters {
	page?: number;
	limit?: number;
	startDate?: Date;
	endDate?: Date;
	templateId?: string;
	searchTerm?: string;
}

export const workoutSessionsApi = {
	/**
	 * Listar sesiones con filtros
	 */
	listSessions: async (filters?: SessionFilters): Promise<PaginatedResponse<WorkoutSession>> =>{
		const params = new URLSearchParams();

		if (filters?.page) params.append('page', filters.page.toString());
		if (filters?.limit) params.append('limit', filters.limit.toString());
		if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
		if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
		if (filters?.templateId) params.append('templateId', filters.templateId);
		if (filters?.searchTerm) params.append('searchTerm', filters.searchTerm);

		const response = await apiClient.get<PaginatedResponse<WorkoutSession>>(`/workout-sessions?${params.toString()}`);

		return response.data;
	},

	/**
	 * Obtener sesión por ID
	 */
	getSession: async (id: string): Promise<WorkoutSession> =>{
		const response = await apiClient.get<ApiResponse<WorkoutSession>>(
			`/workout-sessions/${id}`
		)
		return response.data.data!;
	},

	/**
	 * Crear nueva sesión desde template
	 */
	createSessionFromTemplate: async (
		templateId: string,
		data: Partial<CreateWorkoutSessionData>
	): Promise<WorkoutSession> => {
		const response = await apiClient.post<ApiResponse<WorkoutSession>>(
			`/workout-sessions/from-template/${templateId}`,
			data
		)
		return response.data.data!;
	},

	/**
	 * Crear sesión libre (sin template)
	 */
	createSession: async (data: CreateWorkoutSessionData):Promise<WorkoutSession> => {
		const response = await apiClient.post<ApiResponse<WorkoutSession>>(
			'/workout-sessions',
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
			`/workout-sessions/${id}`,
			data
		)
		return response.data.data!;
	},

	/**
	 * Eliminar sesión
	 */
	deleteSession: async (id:string):Promise<void> => {
		await apiClient.delete(`/workout-sessions/${id}`);
	}

}