import type { CreateWorkoutTemplateData, WorkoutTemplate } from "@/types";
import { apiClient, type ApiResponse, type PaginatedResponse } from "../client";

export const workoutTemplatesApi = {
	/**
	 * Listar templates del usuario
	 */
	listTemplates: async (params?: {
		page?: number;
		limit?: number;
		searchTerm?: string;
	}): Promise<PaginatedResponse<WorkoutTemplate>> => {
		const queryParams = new URLSearchParams();

		if (params?.page) queryParams.append('page', params.page.toString());
		if (params?.limit) queryParams.append('limit', params.limit.toString());
		if (params?.searchTerm) queryParams.append('searchTerm', params.searchTerm);

		const response = await apiClient.get<PaginatedResponse<WorkoutTemplate>>(
			`/workout-templates?${queryParams.toString()}`
		)

		return response.data;
	},

	/**
	 * Obtener template por ID
	 */
	getTemplate: async (id: string): Promise<WorkoutTemplate> => {
		const response = await apiClient.get<ApiResponse<WorkoutTemplate>>(`/workout-templates/${id}`);

		return response.data.data!;
	},

	/**
	 * Crear template
	 */
	createTemplate: async (data: CreateWorkoutTemplateData): Promise<WorkoutTemplate> => {
		const response = await apiClient.post<ApiResponse<WorkoutTemplate>>(
			'/workout-templates',
			data
		);
		return response.data.data!;
	},

	/**
	 * Actualizar template
	 */
	updateTemplate: async (
		id: string,
		data: Partial<CreateWorkoutTemplateData>
	): Promise<WorkoutTemplate> => {
		const response = await apiClient.patch<ApiResponse<WorkoutTemplate>>(
			`/workout-templates/${id}`,
			data
		)
		return response.data.data!;
	},

	/**
	 * Eliminar template
	 */
	deleteTemplate: async (id: string): Promise<void> => {
		await apiClient.delete(`/workout-templates/${id}`);
	},

	/**
	 * Duplicar template
	 */
	duplicateTemplate: async (id: string): Promise<WorkoutTemplate> => {
		const response = await apiClient.post<ApiResponse<WorkoutTemplate>>(
			`/workout-templates/${id}/duplicate`
		);
		return response.data.data!;
	},
	
}