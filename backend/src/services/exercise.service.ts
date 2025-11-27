// src/services/exercise.service.ts
import { exerciseRepository, tagRepository } from "@/repositories/exercise.repository";
import { createAppError } from "@/middlewares/error.middleware";
import { handleServiceError } from "@/utils/error.utils";
import {
	Exercise,
	ExerciseWithTags,
	Tag,
	ExerciseCreateData,
	ExerciseUpdateData,
	ExerciseFilters,
} from "@/types";
import { CreateExerciseInput, UpdateExerciseInput, CreateTagInput } from "@/schemas/exercise.schema";

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validar que un exercise existe
 * @param exerciseId id del exercise
 * @returns Promise<ExerciseWithTags> si existe, error si no existe
 */
const validateExerciseExists = async (exerciseId: string): Promise<ExerciseWithTags> => {
	const exercise = await exerciseRepository.findById(exerciseId);

	if (!exercise) {
		throw createAppError('Exercise not found', 404);
	}
	return exercise;
};

/**
 * Validar que los tags existen
 * @param tagIds ids de los tags
 * @returns Promise<void>
 */
const validateTagsExist = async (tagIds: string[]): Promise<void> => {
	const tags = await Promise.all(tagIds.map((id) => tagRepository.findById(id)))

	const missingTags = tagIds.filter((_, index) => tags[ index ] === null);

	if (missingTags.length > 0) {
		throw createAppError(`Tags not found: ${missingTags.join(', ')}`, 400);
	}
};

/**
 * Sanitizar exercise (eliminar campos sensibles si los hubiera)
 * @param exerciseWithTags 
 * @return ExerciseWithTags
 */
const sanitizeExercise = (exerciseWithTags: ExerciseWithTags): ExerciseWithTags => {
	return exerciseWithTags;
}

// ============================================
// EXERCISE SERVICE
// ============================================

export const exerciseService = {
	/**
	 * Crear exercise
	 * 
	 */
	create: async (input: CreateExerciseInput): Promise<ExerciseWithTags> => {
		try {
			// Validar que el nombre no exista
			const existingExercise = await exerciseRepository.findByName(input.name)

			if (existingExercise) {
				throw createAppError('Exercise with this name already exists', 409);
			}

			// Validar que los tags existen
			if (input.tagIds && input.tagIds?.length > 0) {
				await validateTagsExist(input.tagIds);
			}

			// Convertir input a ExerciseCreateData
			const createData: ExerciseCreateData = {
				name: input.name,
				description: input.description,
				difficulty: input.difficulty,
				muscleGroup: input.muscleGroup,
				type: input.type,
				tagIds: input.tagIds,
			}

			// Crear exercise
			const exercise = await exerciseRepository.create(createData);

			return sanitizeExercise(exercise);

		} catch (error) {
			throw handleServiceError(
				error,
				'ExerciseService.create',
				'Unable to create exercise',
				{ input }
			);
		}
	},

	/**
	 * Obtener exercise por ID
	 * @param id id del exercise
	 * @returns ExerciseWithTags
	 */
	findById: async (exerciseId: string): Promise<ExerciseWithTags> => {
		try {
			const exercise = await validateExerciseExists(exerciseId);
			return sanitizeExercise(exercise);
		} catch (error) {
			throw handleServiceError(
				error,
				'ExerciseService.findById',
				'Unable to retrieve exercise',
				{ exerciseId }
			);
		}
	},

	/**
	 * Listar exercises con filtros
	 * @param filters filtros para buscar exercises (difficulty, muscleGroup, type, tagIDs, searchTerm)
	 * @param page number, página actual
	 * @param limit number, resultados por página
	 * @returns lista de exercises con tags, total, page, totalPages
	 */
	findAll: async (
		filters: Partial<ExerciseFilters> = {},
		page: number = 1,
		limit: number = 10
	): Promise<{
		exercises: ExerciseWithTags[],
		total: number,
		page: number,
		totalPages: number
	}> => {
		// Validación básica
		if (page < 1) page = 1;
		if (limit < 1 || limit > 100) limit = 10;

		try {

			// Obtener exercises y total en paralelo
			const [ exercises, total ] = await Promise.all([
				exerciseRepository.findAll(filters, page, limit),
				exerciseRepository.count(filters),
			]);

			const totalPages = Math.ceil(total / limit);

			return {
				exercises: exercises.map(sanitizeExercise),
				total,
				page,
				totalPages
			}
		} catch (error) {
			throw handleServiceError(
				error,
				'ExerciseService.findAll',
				'Unable to retrieve exercises',
				{ filters, page, limit }
			);
		}
	},

	/**
	 * Actualizar exercise
	 * @param exerciseId id del exercise
	 * @param input datos del exercise a actualizar (name, description, difficulty, muscleGroup, type, tagIds)
	 * @returns ExerciseWithTags
	 */
	update: async (
		exerciseId: string,
		input: UpdateExerciseInput
	): Promise<ExerciseWithTags> => {
		// Verificar que el exercise existe
		await validateExerciseExists(exerciseId);

		try {
			// Si se actualiza el nombre, verificar que no exista
			if (input.name) {
				const existingExercise = await exerciseRepository.findByName(input.name);

				if (existingExercise && existingExercise.id !== exerciseId) {
					throw createAppError('Exercise with this name already exists', 409);
				}
			}

			// Validar que los tags existen
			if (input.tagIds && input.tagIds.length > 0) {
				await validateTagsExist(input.tagIds);
			}

			// Convertir input a ExerciseUpdateData
			const updateData: ExerciseUpdateData = {
				name: input.name,
				description: input.description,
				difficulty: input.difficulty,
				muscleGroup: input.muscleGroup,
				type: input.type,
				tagIds: input.tagIds,
			}

			// Actualizar
			const updateExercise = await exerciseRepository.update(exerciseId, updateData);
			return sanitizeExercise(updateExercise);

		} catch (error) {
			throw handleServiceError(
				error,
				'ExerciseService.update',
				'Unable to update exercise',
				{ exerciseId, input }
			);
		}
	},

	/**
	 * Eliminar exercise
	 * @param exerciseId id del exercise
	 * @returns void
	 */
	delete: async (exerciseId: string): Promise<void> => {
		// Verificar que el exercise existe
		await validateExerciseExists(exerciseId);

		try {
			// Verificar que no este en uso
			const isInUse = await exerciseRepository.isInUse(exerciseId);

			if (isInUse) {
				throw createAppError('Cannot delete exercise that is being used in workouts', 400);
			}

			// Eliminar
			await exerciseRepository.delete(exerciseId)

		} catch (error) {
			throw handleServiceError(
				error,
				'ExerciseService.delete',
				'Unable to delete exercise',
				{ exerciseId }
			)
		}
	},

	/**
	 * Obtener estadísticas de exercises
	 * @returns total, byDifficulty, byType, byMuscleGroup
	 */
	getStats: async (): Promise<{
		total: number,
		byDifficulty: Record<string, number>,
		byType: Record<string, number>,
		byMuscleGroup: Record<string, number>
	}> => {
		try {
			// Obtener todos los exercises
			const exercises = await exerciseRepository.findAll({}, 1, 1000);

			const stats = {
				total: exercises.length,
				byDifficulty: {} as Record<string, number>,
				byType: {} as Record<string, number>,
				byMuscleGroup: {} as Record<string, number>
			};

			// Contar por dificultad
			exercises.forEach(exercise => {
				if (exercise.difficulty) {
					stats.byDifficulty[ exercise.difficulty ] = (stats.byDifficulty[ exercise.difficulty ] || 0) + 1;
				}
			});

			// Contar por tipo
			exercises.forEach(exercise => {
				if (exercise.type) {
					stats.byType[ exercise.type ] = (stats.byType[ exercise.type ] || 0) + 1;
				}
			});

			// Contar por muscleGroup
			exercises.forEach(exercise => {
				if (exercise.muscleGroup) {
					stats.byMuscleGroup[ exercise.muscleGroup ] = (stats.byMuscleGroup[ exercise.muscleGroup ] || 0) + 1;
				}
			})

			return stats;

		} catch (error) {
			throw handleServiceError(
				error,
				'ExerciseService.getStats',
				'Unable to retrieve exercise stats',
			)
		}
	}
}

// ============================================
// TAG SERVICE
// ============================================

export const tagService = {
	/**
	 * Crear tag
	 * @param input información del tag
	 * @returns tag
	*/
	create: async (input: CreateTagInput): Promise<Tag> => {
		try {
			// Verificar que el nombre no exista
			const existingTag = await tagRepository.findByName(input.name);

			if (existingTag) {
				throw createAppError('Tag with this name already exists', 409);
			}

			// Crear tag
			const tag = await tagRepository.create(input.name);

			return tag;

		} catch (error) {
			throw handleServiceError(
				error,
				'TagService.create',
				'Unable to create tag',
				{ input }
			);
		}
	},

	/**
	 * Obtener tag por ID
	 * @param id id del tag
	 * @returns tag
	 */
	findById: async (tagId: string): Promise<Tag> => {
		try {
			const tag = await tagRepository.findById(tagId);

			if (!tag) {
				throw createAppError('Tag not found', 404);
			}

			return tag;

		} catch (error) {
			throw handleServiceError(
				error,
				'TagService.findById',
				'Unable to retrieve tag',
				{ tagId }
			);
		}
	},

	/**
	 * Listar todos los tags
	 * @return lista de tags
	 */
	findAll: async (): Promise<Tag[]> =>{
		try{
			const tags = await tagRepository.findAll();
			return tags;
		}catch(error){
			throw handleServiceError(
				error,
				'TagService.findAll',
				'Unable to retrieve tags',
			);
		}
	},

	/**
	 * Eliminar tag
	 * @param tagId id del tag
	 * @returns void
	 */
	delete: async (tagId: string): Promise<void> => {
		// Verificar que el tag existe
		await tagRepository.findById(tagId);

		try{
			// Verificar que no este en uso
			const isInUse = await tagRepository.isInUse(tagId);

			if(isInUse){
				throw createAppError('Cannot delete tag that is being used by exercises', 400);
			}

			// Eliminar
			await tagRepository.delete(tagId)
		}catch(error){
			throw handleServiceError(
				error,
				'TagService.delete',
				'Unable to delete tag',
				{ tagId }
			)
		}
	}
}