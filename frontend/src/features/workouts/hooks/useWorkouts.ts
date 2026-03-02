// src/features/workouts/hooks/useWorkouts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workoutsApi } from "@/api/endpoints/workouts";
import { queryKeys } from "@/lib/queryClient";
import { toast } from "sonner";
import type { WorkoutFilters, CreateWorkoutData, UpdateWorkoutData } from "@/types";
import { handleApiError } from "@/api/client";

/**
 * Hook para listar workouts
 * @param filters Filtros para listar workouts
 * @returns Workouts
 */
export function useWorkouts(filters?: WorkoutFilters) {
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
export function useWorkout(id?: string) {
	return useQuery({
		queryKey: queryKeys.workout(id!),
		queryFn: () => workoutsApi.getWorkout(id!),
		enabled: !!id,
		staleTime: 5 * 60 * 1000, // 5 minutos
	})
}

/**
 * Hook para crear un nuevo workout
 * @return Mutación de workout con ejercicios
 */
export function useCreateWorkout() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateWorkoutData) => workoutsApi.createWorkout(data),
		onSuccess: () => {
			// Invalidar la cache de workouts
			queryClient.invalidateQueries({ queryKey: [ 'workouts' ] });
			queryClient.invalidateQueries({ queryKey: queryKeys.workoutStats() })

			toast.success('Workout creado con éxito');
		},
		onError: (error) => {
			toast.error(handleApiError(error, 'No se pudo crear el workout'));
		}
	})
}

/**
 * Hook para actualizar workout
 * @return Mutación de workout con ejercicios
 */
export function useUpdateWorkout() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string, data: UpdateWorkoutData }) =>
			workoutsApi.updateWorkout(id, data),
		onSuccess: (_, variables) => {
			// Invalidar cache
			queryClient.invalidateQueries({ queryKey: [ 'workouts' ] });
			queryClient.invalidateQueries({ queryKey: queryKeys.workout(variables.id) })

			
			toast.success('Workout actualizado con éxito');
		
		},
		onError: (error) => {
			toast.error(handleApiError(error, 'No se pudo actualizar el workout'));
		}

	})
}

/**
 * Hook para eliminar workout
 * @return Mutación void
 */
export function useDeleteWorkout() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => workoutsApi.deleteWorkout(id),
		onSuccess: () => {
			// Invalidar cache
			queryClient.invalidateQueries({ queryKey: [ 'workouts' ] });
			queryClient.invalidateQueries({ queryKey: queryKeys.workoutStats() })

			toast.success('Workout eliminado con éxito');
		},
		onError: (error) => {
			toast.error(handleApiError(error, 'No se pudo eliminar el workout'));
		}
	})
}

/**
 * Hook para obtener estadísticas
 */
export function useWorkoutStats(filters?: WorkoutFilters) {
	return useQuery({
		queryKey: queryKeys.workoutStats(filters),
		queryFn: () => workoutsApi.getWorkoutStats(filters),
		staleTime: 5 * 60 * 1000, // 5 minutos
	})
}