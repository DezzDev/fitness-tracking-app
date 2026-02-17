// src/services/workoutTemplate.service.ts
//===================================
// Service
//===================================

import { createAppError } from "@/middlewares/error.middleware";
import { exerciseRepository } from "@/repositories/exercise.repository";
import { workoutTemplateRepository } from "@/repositories/workoutTemplate.repository";
import {
	CreateWorkoutTemplateInput,
	UpdateWorkoutTemplateInput,
	WorkoutTemplateFiltersInput
} from "@/schemas/workoutTemplate.schema";
import {
	WorkoutTemplateCreateData,
	WorkoutTemplateFilters,
	WorkoutTemplateUpdateData,
	WorkoutTemplateWithExercises
} from "@/types";
import { handleServiceError } from "@/utils/error.utils";
import logger from "@/utils/logger";

// ============================================
// Helpers
// ============================================

/**
 * Validar que todos los ejercicios existan
 * @param exerciseIds array de ids de ejercicios
 * @return Promise<void>
 */
const validateExercisesExist = async (exerciseIds: string[]): Promise<void> => {
	try {
		const uniqueIds = [ ...new Set(exerciseIds) ]

		for (const exerciseId of uniqueIds) {
			const exercise = await exerciseRepository.findById(exerciseId);
			if (!exercise) {
				throw createAppError(`Exercise not found: ${exerciseId}`, 404);
			}
		}
	} catch (error) {
		throw handleServiceError(
			error,
			'WorkoutTemplateService.validateExercisesExist',
			'Unable to validate exercises exist',
			{ exerciseIds }
		)
	}
}

/**
 * Validar que el template existe y pertenece al usuario
 * @param templateId id del template
 * @param userId id del usuario
 * @return Promise<WorkoutTemplateWithExercises>
 */
const validateTemplateOwnerShip = async (
	templateId: string,
	userId: string
): Promise<WorkoutTemplateWithExercises> => {
	try {
		const template = await workoutTemplateRepository.findById(templateId)

		if (!template) {
			throw createAppError('Workout template not found', 404);
		}

		if (template.userId !== userId) {
			throw createAppError('Unauthorized', 401);
		}

		return template;
	} catch (error) {
		throw handleServiceError(
			error,
			'WorkoutTemplateService.validateTemplateOwnerShip',
			'Unable to validate template owner ship',
			{ templateId, userId }
		)
	}
}

/**
 * Sanitizar template (remover campos sensibles si fuera necesario)
 * @param template template a sanitizar
 * @return WorkoutTemplateWithExercises
 */
const sanitizeTemplate = (
	template: WorkoutTemplateWithExercises
): WorkoutTemplateWithExercises => {
	return template;
}


// ============================================
// SERVICE
// ============================================

export const workoutTemplateService = {

	/**
	 * Crear nuevo template de ejercicio
	 * @param userId 
	 * @param input datos del template (name, description, exercises)
	 * @returns Promise<WorkoutTemplateWithExercises>
	 */
	create: async (userId: string, input: CreateWorkoutTemplateInput): Promise<WorkoutTemplateWithExercises> => {
		try {
			// validar que todos los ejercicios existan
			await validateExercisesExist(input.exercises.map(e => e.exerciseId))

			// crear template
			const createData: WorkoutTemplateCreateData = {
				userId,
				...input
			}
			const workoutTemplate = await workoutTemplateRepository.create(createData);
			
			if (!workoutTemplate) {
				throw createAppError('Fail to retrieve workout template', 500);
			}

			logger.info('workout template created', {
				userId,
				templateId: workoutTemplate.id,
				exerciseCount : input.exercises.length
			})

			return sanitizeTemplate(workoutTemplate);

		} catch (error) {
			throw handleServiceError(
				error,
				'WorkoutTemplateService.create',
				'Unable to create workout template',
				{ userId, input }
			)
		}
	},

	/**
	 * Obtener template por id
	 * @param templateId id del template
	 * @returns Promise<WorkoutTemplateWithExercises>
	 */
	findById: async (templateId: string, userId: string): Promise<WorkoutTemplateWithExercises> => {
		try {
			const workoutTemplate = await validateTemplateOwnerShip(templateId, userId);

			return sanitizeTemplate(workoutTemplate);

		} catch (error) {
			throw handleServiceError(
				error,
				'WorkoutTemplateService.findById',
				'Unable to retrieve workout template',
				{ templateId, userId }
			)
		}
	},

	findAll: async (
		userId: string,
		filters: WorkoutTemplateFiltersInput = { page: 1, limit: 10 },
	): Promise<{
		templates: WorkoutTemplateWithExercises[],
		total: number,
		page: number,
		totalPages: number,
	}> => {
		const page = filters.page < 1 ? 1 : filters.page;
		const limit = filters.limit < 1 || filters.limit > 100 ? 10 : filters.limit;

		const completeFilters: WorkoutTemplateFilters = {
			userId,
			searchTerm: filters.searchTerm,
			favoritesOnly: filters.favoritesOnly,
		}

		try {
			const [ templates, total ] = await Promise.all([
				workoutTemplateRepository.findAll(completeFilters, page, limit),
				workoutTemplateRepository.count(completeFilters)
			]);

			const totalPages = Math.ceil(total / limit);

			return {
				templates: templates.map(sanitizeTemplate),
				total,
				page,
				totalPages,
			}
		} catch (error) {
			throw handleServiceError(
				error,
				'WorkoutTemplateService.findAll',
				'Unable to retrieve workout templates',
				{ userId, filters }
			)
		}
	},

	update: async (
		templateId: string,
		userId: string,
		input: UpdateWorkoutTemplateInput,
	): Promise<WorkoutTemplateWithExercises> => {
		await validateTemplateOwnerShip(templateId, userId);

		if (input.exercises) {
			await validateExercisesExist(input.exercises.map(e => e.exerciseId));
		}

		const updateData: WorkoutTemplateUpdateData = {
			name: input.name,
			description: input.description,
			exercises: input.exercises,
		}

		try {
			const updatedTemplate = await workoutTemplateRepository.update(templateId, userId, updateData);
			return sanitizeTemplate(updatedTemplate);
		} catch (error) {
			throw handleServiceError(
				error,
				'WorkoutTemplateService.update',
				'Unable to update workout template',
				{ templateId, userId, input }
			)
		}
	},

	delete: async (templateId: string, userId: string): Promise<void> => {
		await validateTemplateOwnerShip(templateId, userId);

		try {
			await workoutTemplateRepository.delete(templateId, userId);
		} catch (error) {
			throw handleServiceError(
				error,
				'WorkoutTemplateService.delete',
				'Unable to delete workout template',
				{ templateId, userId }
			)
		}
	},

	duplicate: async (templateId: string, userId: string): Promise<WorkoutTemplateWithExercises> => {
		const template = await validateTemplateOwnerShip(templateId, userId);

		const duplicateData: CreateWorkoutTemplateInput = {
			name: `${template.name} (Copy)`,
			description: template.description,
			exercises: template.exercises.map((exercise) => ({
				exerciseId: exercise.exerciseId,
				orderIndex: exercise.orderIndex,
				suggestedSets: exercise.suggestedSets,
				suggestedReps: exercise.suggestedReps,
				notes: exercise.notes,
			}))
		}

		return workoutTemplateService.create(userId, duplicateData);
	},

	toggleFavorite: async (templateId: string, userId: string): Promise<WorkoutTemplateWithExercises> => {
		await validateTemplateOwnerShip(templateId, userId);

		try {
			const isFavorite = await workoutTemplateRepository.isFavorite(userId, templateId);

			if (isFavorite) {
				await workoutTemplateRepository.removeFavorite(userId, templateId);
			} else {
				await workoutTemplateRepository.addFavorite(userId, templateId);
			}

			const updatedTemplate = await workoutTemplateRepository.findById(templateId);
			if (!updatedTemplate) {
				throw createAppError('Workout template not found', 404);
			}

			return sanitizeTemplate(updatedTemplate);
		} catch (error) {
			throw handleServiceError(
				error,
				'WorkoutTemplateService.toggleFavorite',
				'Unable to toggle workout template favorite',
				{ templateId, userId }
			)
		}
	}


}
