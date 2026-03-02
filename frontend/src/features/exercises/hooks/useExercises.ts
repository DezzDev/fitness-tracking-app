import { useQuery } from "@tanstack/react-query";
import { exercisesApi } from '@/api/endpoints/exercises';
import { queryKeys } from "@/lib/queryClient";
import type { ExerciseFilters } from "@/types";

/**
 * Hook para listar ejercicios (para seleccionar en workouts)
 * @param filters : (difficulty?: ExerciseDifficulty;
											muscleGroup?: string;
											type?: ExerciseType;
											searchTerm?: string;)
	 * @returns Ejercicios
 */
export function useExercises(filters?: ExerciseFilters) {
	return useQuery({
		queryKey: queryKeys.exercises(filters),
		queryFn: () => exercisesApi.listExercises(filters),
		staleTime: 10 * 60 * 1000, // 10 minutos (los ejercicios no cambian tan seguido)
	})
}

/**
 * Hook para obtener un ejercicio específico por ID
 * Optimizado para usar cache de la lista si existe
 * @param id ID del ejercicio
 * @returns Ejercicio o undefined si no existe
 */
export function useExercise(id: string) {
	return useQuery({
		queryKey: queryKeys.exercise(id),
		queryFn: () => exercisesApi.getExercise(id),
		enabled: !!id,
		staleTime: 10 * 60 * 1000, // 10 minutos

		// inicializar desde cache de la lista si existe
		placeholderData: (_, previousQuery) => {
			// Buscar en cache de la lista de ejercicios
			const exercisesCache = previousQuery?.state.data;
			if (exercisesCache && Array.isArray(exercisesCache)) {
				return exercisesCache.find((ex) => ex.id === id)
			}
			return undefined
		}
	})
}