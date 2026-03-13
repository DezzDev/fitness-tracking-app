import type { CreateWorkoutTemplateData, WorkoutTemplate } from "@/types";
import { apiClient, type ApiResponse, type PaginatedResponse } from "../client";

interface TemplatesListResponse  {
	success: boolean
	message: string
	data: {
		templates: WorkoutTemplate[]
		total: number
		page: number
		totalPages: number
	}
	timestamp: string
}


export const workoutTemplatesApi = {
	/**
	 * Listar templates con filtros
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

		const response = await apiClient.get<TemplatesListResponse>(
			`/workoutTemplates?${queryParams.toString()}`
		)

		const { success, message, data, timestamp } = response.data;

		return {
			success,
			message,
			timestamp,
			data: {
				items: data.templates,
				total: data.total,
				page: data.page,
				totalPages: data.totalPages
			}
		};
	},

	/**
	 * Obtener template por ID
	 */
	getTemplate: async (id: string): Promise<WorkoutTemplate> => {
		const response = await apiClient.get<ApiResponse<WorkoutTemplate>>(`/workoutTemplates/${id}`);

		return response.data.data!;
	},

	/**
	 * Obtener templates programados para hoy
	 */
	getScheduledToday: async (): Promise<WorkoutTemplate[]> => {
		const response = await apiClient.get<ApiResponse<WorkoutTemplate[]>>('/workoutTemplates/today');
		return response.data.data!;
	},

	/**
	 * Crear template
	 */
	createTemplate: async (data: CreateWorkoutTemplateData): Promise<WorkoutTemplate> => {
		const response = await apiClient.post<ApiResponse<WorkoutTemplate>>(
			'/workoutTemplates',
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
			`/workoutTemplates/${id}`,
			data
		)
		return response.data.data!;
	},

	/**
	 * Eliminar template
	 */
	deleteTemplate: async (id: string): Promise<void> => {
		await apiClient.delete(`/workoutTemplates/${id}`);
	},

	/**
	 * Duplicar template
	 */
	duplicateTemplate: async (id: string): Promise<WorkoutTemplate> => {
		const response = await apiClient.post<ApiResponse<WorkoutTemplate>>(
			`/workoutTemplates/${id}/duplicate`
		);
		return response.data.data!;
	},

	/**
	 * Agregar/quitar favorito
	 */
	toggleFavorite: async (id: string): Promise<WorkoutTemplate> => {
		const response = await apiClient.patch<ApiResponse<WorkoutTemplate>>(
			`/workoutTemplates/${id}/favorite`
		);
		return response.data.data!;
	}
	
}
