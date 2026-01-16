// src/api/endpoints/workouts.ts
import { apiClient, type ApiResponse, type PaginatedResponse } from "@/api/client";
import type {
	
	WorkoutWithExercises,
	CreateWorkoutData,
	WorkoutFilters,
	WorkoutStats
} from "@/types";

type WorkoutsWithExercisesResponse = {
	success: boolean
	message: string
	data: {
		workouts: WorkoutWithExercises[]
		total: number
		page: number
		totalPages: number
	}
	timestamp: string
}

export const workoutsApi = {

	/**
	 * Listar workouts con filtros
	 * @param filters Filtros para filtrar los resultados
	 * @returns Workouts, total, page, totalPages
	 */
	listWorkouts: async (filters?: WorkoutFilters): Promise<PaginatedResponse<WorkoutWithExercises>> => {
		const params = new URLSearchParams();

		if (filters?.page) params.append('page', filters.page.toString());
		if (filters?.limit) params.append('limit', filters.limit.toString());
		if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
		if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
		if (filters?.searchTerm) params.append('searchTerm', filters.searchTerm);

		const response = await apiClient.get<WorkoutsWithExercisesResponse>(
			`/workouts?${params.toString()}`
		);

		// recuperamos los datos
		const {success, message, data, timestamp} = response.data;

		// remap para cambiar el nombre de workouts a items, 
		// que es la firma que tenemos en PaginatedResponse
		return {
			success,
			message,
			timestamp,
			data: {
				items: data.workouts,
				total: data.total,
				page: data.page,
				totalPages: data.totalPages
			}
		};
	},

	/**
	 * Obtener workout por ID con ejercicios completos
	 * @param id ID del workout
	 * @returns Workout con ejercicios
	 */
	getWorkout: async (id: string): Promise<WorkoutWithExercises> => {
		const response = await apiClient.get<ApiResponse<WorkoutWithExercises>>(
			`/workouts/${id}`
		);
		console.log(response.data.data)
		return response.data.data!;
	},

	/**
	 * Crear nuevo workout
	 * @param data Datos para crear el workout
	 * @returns Workout con ejercicios
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
	 * @param id ID del workout
	 * @param data Datos para actualizar el workout
	 * @returns Workout con ejercicios actualizado
	 */
	updateWorkout: async (
		id: string,
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
	 * @param id ID del workout
	 */
	deleteWorkout: async (id: string): Promise<void> => {
		await apiClient.delete(`/workouts/${id}`);
	},

	/**
	 * Obtener estadísticas de workouts
	 * @param filters Filtros para las estadísticas
	 * @returns Estadísticas de workouts
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