import {apiClient, type ApiResponse, type PaginatedResponse} from '../client';
import type { Exercise, ExerciseFilters } from '@/types';

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

		const response = await apiClient.get<PaginatedResponse<Exercise>>(
			`/exercises?${params.toString()}`
		);

		return response.data;
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
	}
}