// src/features/workouts/hooks/useExercise.ts
import { useQuery } from "@tanstack/react-query";
import { exercisesApi } from "@/api/endpoints/exercises";
import { queryKeys } from "@/lib/queryClient";
import type { ExerciseFilters } from "@/types";

/**
 * Hook para listar ejercicios (para seleccionar en workouts)
 */
export function useExercises(filters?: ExerciseFilters) {
	return useQuery({
		queryKey: queryKeys.exercises(filters),
		queryFn: () => exercisesApi.listExercises(filters),
		staleTime: 10 * 60 * 1000, // 10 minutos (los ejercicios no cambian tan seguido)
	})
}