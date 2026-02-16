// src/services/workoutTemplate.service.ts
//===================================
// Service
//===================================

import { createAppError } from "@/middlewares/error.middleware";
import { exerciseRepository } from "@/repositories/exercise.repository";
import { workoutTemplateRepository } from "@/repositories/workoutTemplate.repository";
import { CreateWorkoutTemplateInput } from "@/schemas/workoutTemplate.schema";
import { WorkoutTemplateCreateData, WorkoutTemplateWithExercises } from "@/types";
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
	findById: async (templateId: string): Promise<WorkoutTemplateWithExercises> => {
		try {
			const workoutTemplate = await workoutTemplateRepository.findById(templateId);

			if (!workoutTemplate) {
				throw createAppError('Workout template not found', 404);
			}

			return sanitizeTemplate(workoutTemplate);

		} catch (error) {
			throw handleServiceError(
				error,
				'WorkoutTemplateService.findById',
				'Unable to retrieve workout template',
				{ templateId }
			)
		}
	},


}