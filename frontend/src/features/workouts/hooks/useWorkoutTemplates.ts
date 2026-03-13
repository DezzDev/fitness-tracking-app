import { handleApiError } from "@/api/client";
import { workoutTemplatesApi } from "@/api/endpoints/workoutTemplates";
import type { CreateWorkoutTemplateData } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const templateKeys = {
	all: [ 'workout-templates' ] as const,
	lists: () => [ ...templateKeys.all, 'list' ] as const,
	list: (filters?: unknown) => [ ...templateKeys.lists(), filters ] as const,
	details: () => [ ...templateKeys.all, 'detail' ] as const,
	detail: (id: string) => [ ...templateKeys.details(), id ] as const,
	today: () => [ ...templateKeys.all, 'today' ] as const,
};

/**
 * Hook para listar templates
 */
export function useWorkoutTemplates(params?: {
	page?: number;
	limit?: number;
	searchTerm?: string;
}) {
	return useQuery({
		queryKey: templateKeys.list(params),
		queryFn: () => workoutTemplatesApi.listTemplates(params),
		staleTime: 2 * 60 * 1000,
	});
}

/**
 * Hook para obtener un template específico
 */
export function useWorkoutTemplate(id: string) {
	return useQuery({
		queryKey: templateKeys.detail(id),
		queryFn: () => workoutTemplatesApi.getTemplate(id),
		enabled: !!id,
		staleTime: 5 * 60 * 1000,
	});
}

/**
 * Hook para obtener templates programados para hoy
 */
export function useScheduledTemplate() {
	return useQuery({
		queryKey: templateKeys.today(),
		queryFn: () => workoutTemplatesApi.getScheduledToday(),
		staleTime: 10 * 60 * 1000, // 10 minutos - no cambia tan frecuentemente
	});
}

/**
 * Hook para crear template
 */
export function useCreateTemplate() {
	const queryClient = useQueryClient();


	return useMutation({
		mutationFn: (data: CreateWorkoutTemplateData) =>
			workoutTemplatesApi.createTemplate(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
			queryClient.invalidateQueries({ queryKey: templateKeys.today() });

			toast('✅ Plantilla creada');
		},
		onError: (error) => {
			toast.error(handleApiError(error, 'No se pudo crear la plantilla'));
		}
	});
}

/**
 * Hook para actualizar template
 */
export function useUpdateTemplate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<CreateWorkoutTemplateData> }) =>
			workoutTemplatesApi.updateTemplate(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
			queryClient.invalidateQueries({ queryKey: templateKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: templateKeys.today() });

			toast('✅ Plantilla actualizada');
		},
		onError: (error) => {
			toast.error(handleApiError(error, 'No se pudo actualizar la plantilla'));
		}
	});
}

/**
 * Hook para eliminar template
 */
export function useDeleteTemplate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => workoutTemplatesApi.deleteTemplate(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
			queryClient.invalidateQueries({ queryKey: templateKeys.today() });

			toast('Plantilla eliminada');
		},
		onError: (error) => {
			toast.error(handleApiError(error, 'No se pudo eliminar la plantilla'));
		}
	});
}

/**
 * Hook para duplicar template
 */
export function useDuplicateTemplate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => workoutTemplatesApi.duplicateTemplate(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: templateKeys.lists() });

			toast('✅ Plantilla duplicada');
		},
		onError: (error) => {
			toast.error(handleApiError(error, 'No se pudo duplicar la plantilla'));
		}
	});
}

/**
 * Hook para alternar favorito
 */
export function useToggleFavorite() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => workoutTemplatesApi.toggleFavorite(id),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
			queryClient.invalidateQueries({ queryKey: templateKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: templateKeys.today() });

			toast('✅ Favorito actualizado');
		},
		onError: (error) => {
			toast.error(handleApiError(error, 'No se pudo actualizar el favorito'));
		}
	});
}

