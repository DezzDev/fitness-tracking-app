import {apiClient, type ApiResponse, type PaginatedResponse} from '../client';
import type { Exercise, ExerciseFilters, ExerciseStats } from '@/types';

type ExerciseListResponse = {
	success: boolean
	message: string
	data: {
		exercises: Exercise[]
		total: number
		page: number
		totalPages: number
	}
	timestamp: string
}

export const exercisesApi = {
	/**
	 * Listar ejercicios con filtros
	 * @param filters Filtros para filtrar los resultados
	 * @returns ejercicios
	 */
	listExercises: async (filters?:ExerciseFilters): Promise<PaginatedResponse<Exercise>> =>{
		const params = new URLSearchParams();

		if(filters?.page) params.append('page', filters.page.toString());
		if(filters?.limit) params.append('limit', filters.limit.toString());
		if(filters?.difficulty) params.append('difficulty', filters.difficulty);
		if(filters?.muscleGroup) params.append('muscleGroup', filters.muscleGroup);
		if(filters?.type) params.append('type', filters.type);
		if(filters?.searchTerm) params.append('searchTerm', filters.searchTerm);

		const response = await apiClient.get<ExerciseListResponse>(
			`/exercises?${params.toString()}`
		);

		const {success, message, data, timestamp} = response.data;

		return {
			success,
			message,
			timestamp,
			data: {
				items: data.exercises,
				total: data.total,
				page: data.page,
				totalPages: data.totalPages
			}
		};
	},

	/**
	 * Obtener ejercicio por ID
	 * @param id ID del ejercicio
	 * @returns ejercicio
	 */
	getExercise: async (id: string): Promise<Exercise> => {
		const response = await apiClient.get<ApiResponse<Exercise>>(
			`/exercises/${id}`
		);
		return response.data.data!;
	},

	/**
	 * Obtener estadísticas de ejercicios
	 * @returns estadísticas (total, byDifficulty, byType, byMuscleGroup)
	 */
	getStats: async (): Promise<ExerciseStats> => {
		const response = await apiClient.get<ApiResponse<ExerciseStats>>(
			'/exercises/stats'
		);
		return response.data.data!;
	}
}