//src/lib/queryClient.ts
import {QueryClient} from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// tiempo de caché de 5 minutos
			staleTime: 5 * 60 * 1000,

			// Tiempo antes de garbage collection de 10 minutos
			gcTime: 10 * 60 * 1000,

			// Reintentos en caso de error
			retry: 2,

			// No refetch automático al enfocar ventana (se puede cambiar)
			refetchOnWindowFocus: false,

			// No refetch automático al reconectar (se puede cambiar)
			refetchOnReconnect: false,
		},
		mutations: {
			// Reintentos para mutaciones
			retry: 0,
		}
	}
});

// Query keys centralizadas 
export const queryKeys = {
	// Auth
	profile: ['profile'] as const,

	// Workouts
	workouts: (filters?: unknown) => ['workouts', filters] as const,
	workout: (id: number) => ['workout', id] as const,
	workoutStats: (filters?: unknown) => ['workoutStats', filters] as const,

	// Exercises
	exercises: (filters?: unknown) => ['exercises', filters] as const,
	exercise: (id: number) => ['exercise', id] as const,
	exerciseStats: ['exerciseStats'] as const,

	// Tags
	tags: ['tags'] as const,
	tag: (id: number) => ['tag', id] as const,

	// Progress
	progressLogs: (userId?: number) => ['progressLogs', userId] as const,

	// Goals
	userGoals: (userId?: number) => ['userGoals', userId] as const,

	// Personal Records
	personalRecords: (userId?: number) => ['personalRecords', userId] as const,
}