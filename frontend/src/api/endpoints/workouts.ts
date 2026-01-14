// src/api/endpoints/workouts.ts
import { apiClient, type ApiResponse, type PaginatedResponse } from "@/api/client";
import type {
	Workout,
	WorkoutWithExercises,
	CreateWorkoutData,
	WorkoutFilters,
	WorkoutStats
} from "@/types";

type WorkoutListResponse = {
	success: boolean
	message: string
	data: {
		workouts: Workout[]
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
	listWorkouts: async (filters?: WorkoutFilters): Promise<PaginatedResponse<Workout>> => {
		const params = new URLSearchParams();

		if (filters?.page) params.append('page', filters.page.toString());
		if (filters?.limit) params.append('limit', filters.limit.toString());
		if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
		if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
		if (filters?.searchTerm) params.append('searchTerm', filters.searchTerm);

		const response = await apiClient.get<WorkoutListResponse>(
			`/workouts?${params.toString()}`
		);

		const {success, message, data, timestamp} = response.data;


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
		const workoutWithExercises = {
			id: response.data.data?.id,
			userId: response.data.data?.userId,
			title: response.data.data?.title,
			notes: response.data.data?.notes,
			createdAt: response.data.data?.createdAt,
			exercises: response.data.data?.exercises.map()
		}
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