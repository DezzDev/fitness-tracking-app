// src/features/workouts/hooks/useWorkoutSessions.ts

import { handleApiError } from "@/api/client";
import { workoutSessionsApi, type CreateSessionFromTemplateData } from "@/api/endpoints/workoutSessions";
import type { CreateWorkoutSessionData, SessionFilters } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const sessionKeys = {
	all: [ 'workout-sessions' ] as const,
	lists: () => [ ...sessionKeys.all, 'list' ] as const,
	list: (filters?: SessionFilters) => [ ...sessionKeys.lists(), filters ] as const,
	details: () => [ ...sessionKeys.all, 'detail' ] as const,
	detail: (id: string) => [ ...sessionKeys.details(), id ] as const,
	recent: (limit?: number) => [ ...sessionKeys.all, 'recent', limit ] as const,
	stats: () => [ ...sessionKeys.all, 'stats' ] as const,
};

/**
 * Hook para listar sesiones
 */
export function useWorkoutSessions(filters?: SessionFilters) {
	return useQuery({
		queryKey: sessionKeys.list(filters),
		queryFn: () => workoutSessionsApi.listSessions(filters),
		staleTime: 2 * 60 * 1000,
	});
}

/**
 * Hook para obtener una sesión específica
 */
export function useWorkoutSession(id: string) {
	return useQuery({
		queryKey: sessionKeys.detail(id),
		queryFn: () => workoutSessionsApi.getSession(id),
		enabled: !!id,
		staleTime: 5 * 60 * 1000,
	});
}

/**
 * Hook para obtener sesiones recientes
 */
export function useRecentSessions(limit?: number) {
	return useQuery({
		queryKey: sessionKeys.recent(limit),
		queryFn: () => workoutSessionsApi.getRecentSessions(limit),
		staleTime: 1 * 60 * 1000,
	});
}

/**
 * Hook para obtener estadísticas de sesiones
 */
export function useSessionStats() {
	return useQuery({
		queryKey: sessionKeys.stats(),
		queryFn: () => workoutSessionsApi.getSessionStats(),
		staleTime: 5 * 60 * 1000,
	});
}

/**
 * Hook para crear sesión desde template
 */
export function useCreateSessionFromTemplate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateSessionFromTemplateData) => 
			workoutSessionsApi.createSessionFromTemplate(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
			queryClient.invalidateQueries({ queryKey: sessionKeys.recent() });
			queryClient.invalidateQueries({ queryKey: sessionKeys.stats() });

			toast('✅ Sesión de entrenamiento creada');
		},
		onError: (error) => {
					toast.error(handleApiError(error, 'No se pudo iniciar la sesión de entrenamiento'));
				}
	});
}

/**
 * Hook para crear sesión libre
 */
export function useCreateSession() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateWorkoutSessionData) =>
			workoutSessionsApi.createSession(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
			queryClient.invalidateQueries({ queryKey: sessionKeys.recent() });
			queryClient.invalidateQueries({ queryKey: sessionKeys.stats() });

			toast('✅ Sesión de entrenamiento creada');
		},
		onError: (error) => {
			toast.error(handleApiError(error, 'No se pudo guardar la sesión de entrenamiento'));
		}
	});
}

/**
 * Hook para actualizar sesión
 */
export function useUpdateSession() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data
		}: {
			id: string;
			data: Partial<CreateWorkoutSessionData>
		}) => workoutSessionsApi.updateSession(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
			queryClient.invalidateQueries({ queryKey: sessionKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: sessionKeys.stats() });

		toast('✅ Sesión de entrenamiento actualizada');
		},
		onError: (error) => {
			toast.error(handleApiError(error, 'No se pudo actualizar la sesión de entrenamiento'));
		}
	});
}

/**
 * Hook para eliminar sesión
 */
export function useDeleteSession() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => workoutSessionsApi.deleteSession(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
			queryClient.invalidateQueries({ queryKey: sessionKeys.stats() });

			toast('✅ Sesión de entrenamiento eliminada');
		},
		onError: (error) => {
			toast.error(handleApiError(error, 'No se pudo eliminar la sesión de entrenamiento'));
		}
	});
}
