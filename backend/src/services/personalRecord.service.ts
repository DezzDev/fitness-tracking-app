// src/services/personalRecord.service.ts

import { createAppError } from "@/middlewares/error.middleware";
import { exerciseRepository } from "@/repositories/exercise.repository"
import { personalRecordRepository } from "@/repositories/personalRecord.repository";
import { CreatePersonalRecordInput, UpdatePersonalRecordInput } from "@/schemas/personalRecord.schema";
import { PersonalRecordCreateData, PersonalRecordFilters, PersonalRecordUpdateData, PersonalRecordWithExercise } from "@/types";
import { handleServiceError } from "@/utils/error.utils";
import logger from "@/utils/logger";

//===========================================
// Helpers Functions
//===========================================

/**
 * Validar que el exercise existe
 * @param exerciseId id del exercise
 * @returns Promise<void>
 */

const validateExerciseExists = async (exerciseId: string): Promise<void> => {
	try {
		const exercise = await exerciseRepository.findById(exerciseId);

		if (!exercise) {
			throw createAppError('Exercise not found', 404);
		}

	} catch (error) {
		throw handleServiceError(
			error,
			'PersonalRecordService.validateExerciseExists',
			'Unable to validate exercise exists',
			{ exerciseId }
		)
	}
}

/**
 * Validar que el PR existe y pertenece al usuario
 * @param recordId id del personal record
 * @param userId id del usuario
 * @returns Promise<PersonalRecordWithExercise>
 */
const validatePersonalRecordOwnership = async (
	recordId: string,
	userId: string
): Promise<PersonalRecordWithExercise> => {
	try {
		const record = await personalRecordRepository.findById(recordId, userId);

		if (!record) {
			throw createAppError('Personal record not found', 404);
		}

		return record;

	} catch (error) {
		throw handleServiceError(
			error,
			'PersonalRecordService.validatePersonalRecordOwnership',
			'Unable to validate personal record ownership',
			{ recordId, userId }
		)
	}
}

/**
 * Comprobar si los nuevos valores son mejores que los actuales
 * @param current PersonalRecordWithExercise actual
 * @param newData PersonalRecordUpdateData nuevos valores
 * @returns boolean
 */
const isBetterRecord = (
	current: PersonalRecordWithExercise,
	newData: PersonalRecordUpdateData
): boolean => {
	let isBetter = false;

	if (newData.maxReps !== undefined && newData.maxReps > (current.maxReps ?? 0)) {
		isBetter = true;
	}

	if (newData.maxDurationSeconds !== undefined &&
		newData.maxDurationSeconds > (current.maxDurationSeconds ?? 0)) {
		isBetter = true;
	}

	if (newData.maxWeight !== undefined && newData.maxWeight > (current.maxWeight ?? 0)) {
		isBetter = true;
	}

	return isBetter;
}

/**
 * Sanitizar PR
 */
const sanitizePersonalRecord = (record: PersonalRecordWithExercise): PersonalRecordWithExercise => {
	return record;
}

//===========================================
// Personal Record Service
//===========================================

export const personalRecordService = {
	/**
	 * Crear o actualizar personal record
	 * @param userId id del usuario
	 * @param input datos del personal record (ejercicioId, maxReps, maxDurationSeconds, maxWeight)
	 * @returns personal record con ejercicio
	 */
	createOrUpdate: async (
		userId: string,
		input: CreatePersonalRecordInput
	): Promise<{
		record: PersonalRecordWithExercise,
		isNew: boolean,
		improved: boolean
	}> => {
		try {
			// Verificar que el exercise existe
			await validateExerciseExists(input.exerciseId)

			// Verificar si ya existe un PR para este ejercicio
			const existingRecord = await personalRecordRepository.findByUserAndExercise(userId, input.exerciseId)

			if (existingRecord) {
				// Verificar si los valores son mejores
				const updateData: PersonalRecordUpdateData = {
					maxReps: input.maxReps,
					maxDurationSeconds: input.maxDurationSeconds,
					maxWeight: input.maxWeight,
				}

				const improved = isBetterRecord(existingRecord, updateData)

				if (!improved) {
					logger.info('Personal record not improved', {
						userId,
						exerciseId: input.exerciseId,
						current: existingRecord,
						attempted: input
					})

					return {
						record: sanitizePersonalRecord(existingRecord),
						isNew: false,
						improved: false
					}
				}

				// Actualizar record
				const updateRecord = await personalRecordRepository.update(
					existingRecord.id,
					userId,
					updateData
				)

				logger.info('Personal record improved', {
					userId,
					exerciseId: input.exerciseId,
					recordId: updateRecord.id,
					improvements: {
						reps: input.maxReps !== undefined,
						duration: input.maxDurationSeconds !== undefined,
						weight: input.maxWeight !== undefined
					}
				})

				return {
					record: sanitizePersonalRecord(updateRecord),
					isNew: false,
					improved: true
				}
			}

			// Crear record
			const createData : PersonalRecordCreateData = {
				userId,
				exerciseId: input.exerciseId,
				maxReps: input.maxReps,
				maxDurationSeconds: input.maxDurationSeconds,
				maxWeight: input.maxWeight
			}

			const newRecord = await personalRecordRepository.create(createData)

			logger.info('Personal record created', {
				userId,
				exerciseId: input.exerciseId,
				recordId: newRecord.id,
			})

			return {
				record: sanitizePersonalRecord(newRecord),
				isNew: true,
				improved: false
			}

		} catch (error) {
			throw handleServiceError(
				error,
				'PersonalRecordService.createOrUpdate',
				'Unable to create or update personal record',
				{ userId, input }
			)
		}
	},

	/**
	 * Obtener PR por ID
	 * @param recordId id del personal record
	 * @param userId id del usuario
	 * @returns personal record con ejercicio
	 */
	findById: async (
		recordId: string,
		userId:string
	): Promise<PersonalRecordWithExercise> => {
		const record = await validatePersonalRecordOwnership(recordId, userId);
		try {
			return sanitizePersonalRecord(record);
		} catch (error) {
			throw handleServiceError(
				error,
				'PersonalRecordService.findById',
				'Unable to retrieve personal record',
				{ recordId, userId }
			)
		}
	},

	/**
	 * Obtener PR por ejercicio
	 * @param userId id del usuario
	 * @param exerciseId id del ejercicio
	 * @returns personal record con ejercicio o null
	 */
	findByExercise: async (
		userId: string,
		exerciseId: string
	): Promise<PersonalRecordWithExercise | null> => {
		try {
			await validateExerciseExists(exerciseId);
			const record = await personalRecordRepository.findByUserAndExercise(userId, exerciseId);

			return record ? sanitizePersonalRecord(record) : null;

		} catch (error) {
			throw handleServiceError(
				error,
				'PersonalRecordService.findByExercise',
				'Unable to retrieve personal record',
				{ userId, exerciseId }
			)
		}
	},

	/**
	 * Listar PRs con filtros
	 * @param userId id del usuario
	 * @param filters filtros para buscar personal records (userId?, exerciseId?, muscleGroup?, difficulty?, type?)
	 * @param page página actual
	 * @param limit número de resultados por página
	 * @returns lista de personal records con ejercicio
	 */
	findAll : async (
		userId: string,
		filters: PersonalRecordFilters = {},
		page: number = 1,
		limit: number = 10
	): Promise<{
		records: PersonalRecordWithExercise[],
		total: number,
		page: number,
		totalPages: number
	}> => {
		// VAlidación básica
		if (page < 1) page = 1;
		if (limit <1 || limit > 100) limit = 10;

		const completeFilters: PersonalRecordFilters= {
			userId,
			...filters
		}

		try {
			// Obtener records y total en paralelo
			const [records, total] = await Promise.all([
				personalRecordRepository.findAll(completeFilters, page, limit),
				personalRecordRepository.count(completeFilters)
			])

			const totalPages = Math.ceil(total / limit);

			return {
				records: records.map(sanitizePersonalRecord),
				total,
				page,
				totalPages
			}
		} catch (error) {
			throw handleServiceError(
				error,
				'PersonalRecordService.findAll',
				'Unable to retrieve personal records',
				{ userId, filters , page, limit }
			)
		}
	},

	/**
	 * Actualizar PR manualmente
	 * @param recordId id del personal record
	 * @param userId id del usuario
	 * @param input datos del personal record a actualizar (maxReps, maxDurationSeconds, maxWeight)
	 * @returns personal record con ejercicio
	 */
	update: async (
		recordId: string,
		userId: string,
		input: UpdatePersonalRecordInput
	): Promise<PersonalRecordWithExercise> => {
		// Verificar que el record existe y pertenece al ausuario
		const currentRecord = await validatePersonalRecordOwnership(recordId, userId);

		try {
			// Verificar que es una mejora
			const improved = isBetterRecord(currentRecord, input)

			if(!improved){
				throw createAppError('New values are not better than current personal record', 400);
			}

			// Actualizar
			const updateRecord = await personalRecordRepository.update(recordId, userId, input)

			return sanitizePersonalRecord(updateRecord);

		} catch (error) {
			throw handleServiceError(
				error,
				'PersonalRecordService.update',
				'Unable to update personal record',
				{ recordId, userId, input }
			)
		}
	},

	/**
	 * Eliminar PR
	 * @param recordId id del personal record
	 * @param userId id del usuario
	 * @returns void
	 */
	delete: async (recordId: string, userId: string): Promise<void> => {
		// Verificar que existe y pertenece al usuario
		await validatePersonalRecordOwnership(recordId, userId);

		try {
			// Eliminar 
			await personalRecordRepository.delete(recordId, userId);
		} catch (error) {
			throw handleServiceError(
				error,
				'PersonalRecordService.delete',
				'Unable to delete personal record',
				{ recordId, userId }
			)
		}
	},

	/**
	 * Obtener estadísticas de PRs
	 * @param userId id del usuario
	 * @returns total, byMuscleGroup, byDifficulty, byType, recentRecords
	 */
	getStats: async (
		userId: string
	): Promise<{
		total: number,
		byMuscleGroup: Record<string, number>,
		byDifficulty: Record<string, number>,
		byType: Record<string, number>,
		recentRecords: PersonalRecordWithExercise[]
	}> => {
		try {
			// Obtener todos los PRs del usuario
			const  filters: PersonalRecordFilters = {userId}
			const allRecords = await personalRecordRepository.findAll(filters, 1, 1000);

			// Obtener record recientes
			const recentRecords = await personalRecordRepository.findRecent(userId, 5)

			const stats = {
				total: allRecords.length,
				byMuscleGroup: {} as Record<string, number>,
				byDifficulty: {} as Record<string, number>,
				byType: {} as Record<string, number>,
				recentRecords: recentRecords.map(sanitizePersonalRecord)
			}

			// contar por muscleGroup
			allRecords.forEach(record => {
				if(record.muscleGroup) {
					stats.byMuscleGroup[record.muscleGroup] =
						(stats.byMuscleGroup[record.muscleGroup] || 0) + 1;
				}
			})

			// contar por dificultad
			allRecords.forEach(record => {
				if(record.difficulty) {
					stats.byDifficulty[record.difficulty] =
						(stats.byDifficulty[record.difficulty] || 0) + 1;
				}
			})

			// contar por tipo
			allRecords.forEach(record => {
				if(record.type) {
					stats.byType[record.type] =
						(stats.byType[record.type] || 0) + 1;
				}
			})

			return stats;

		} catch (error) {
			throw handleServiceError(
				error,
				'PersonalRecordService.getStats',
				'Unable to retrieve personal record stats',
				{ userId }
			)
		}
	},

	/**
	 * Auto-detectar y crear PRs desde un workout completo
	 */
	autoDetectFromWorkout: async (
		userId: string,
		workoutId: string
	): Promise<{
		created: PersonalRecordWithExercise[];
		improved: PersonalRecordWithExercise[];
	}> => {
		// Esta función se puede implementar después
		// Analizaría un workout completado y detectaría automáticamente
		// si hubo mejoras en reps, duración o peso que califiquen como PR

		logger.info('Auto-detect PRs from workout', { userId, workoutId });

		return {
			created: [],
			improved: [],
		};
	},

}

