// src/features/workouts/hooks/useWorkouts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workoutsApi } from "@/api/endpoints/workouts";
import { queryKeys } from "@/lib/queryClient";
import { toast } from "sonner";
import {WorkoutFilters, CreateWorkoutData} from "@/types";

/**
 * Hook para listar workouts
 * @param filters Filtros para listar workouts
 * @returns Workouts
 */
export function useWorkouts(filters?: WorkoutFilters){
	return useQuery({
		queryKey: queryKeys.workouts(filters),
		queryFn: () => workoutsApi.listWorkouts(filters),
		staleTime: 2 * 60 * 1000, // 2 minutos
	});
}

/**
 * Hook para obtener un workout por ID
 * @param id ID del workout
 * @returns Workout con ejercicios
 */
export function useWorkout(id?:string){
	return useQuery({
		queryKey: queryKeys.workout(id!),
		queryFn: () => workoutsApi.getWorkout(id!),
		enabled: !!id,
		staleTime: 5 * 60 * 1000, // 5 minutos
	})
}
