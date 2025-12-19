// src/api/endpoints/workouts.ts
import { apiClient, type ApiResponse, type PaginatedResponse } from "@/api/client";
import type {
	Workout,
	WorkoutWithExercises,
	CreateWorkoutData,
	WorkoutFilters,
	WorkoutStats
} from "@/types";

export const workoutsApi = {

	/**
	 * Listar workouts con filtros
	 * @param filters Filtros para filtrar los resultados
	 * @returns Datos de los workouts
	 */
	listWorkouts: async (filters?: WorkoutFilters): Promise<PaginatedResponse<Workout>> => {
		const params = new URLSearchParams();

		if (filters?.page) params.append('page', filters.page.toString());
		if (filters?.limit) params.append('limit', filters.limit.toString());
		if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
		if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
		if (filters?.searchTerm) params.append('searchTerm', filters.searchTerm);

		const response = await apiClient.get<PaginatedResponse<Workout>>(
			`/workouts?${params.toString()}`
		);

		return response.data;
	},

	/**
	 * Obtener workout por ID con ejercicios completos
	 * @param id ID del workout
	 * @returns Datos del workout con ejercicios completos
	 */
	getWorkout: async (id: string): Promise<WorkoutWithExercises> => {
		const response = await apiClient.get<ApiResponse<WorkoutWithExercises>>(
			`/workouts/${id}`
		);
		return response.data.data!;
	},

	/**
	 * Crear nuevo workout
	 * @param data Datos para crear el workout
	 * @returns Datos del workout creado
	 */
	createWorkout: async (data: CreateWorkoutData): Promise<WorkoutWithExercises> => {
		const response = await apiClient.post<ApiResponse<WorkoutWithExercises>>(
			`/workouts`,
			data
		);
		return response.data.data!;
	},

	/** 
	 * Actualizar workout
	 */
	updateWorkout: async (
		id: number,
		data: Partial<CreateWorkoutData>
	): Promise<WorkoutWithExercises> => {
		const response = await apiClient.patch<ApiResponse<WorkoutWithExercises>>(
			`/workouts/${id}`,
			data
		);
		return response.data.data!;
	},

	/**
	 * Eliminar workout
	 */
	deleteWorkout: async (id: string): Promise<void> => {
		await apiClient.delete(`/workouts/${id}`);
	},

	/**
	 * Obtener estadísticas de workouts
	 */
	getWorkoutStats: async (filters?: WorkoutFilters): Promise<WorkoutStats> => {
		const params = new URLSearchParams();

		if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
		if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());

		const response = await apiClient.get<ApiResponse<WorkoutStats>>(
			`/workouts/stats?${params.toString()}`
		);
		return response.data.data!;
	},
	
}