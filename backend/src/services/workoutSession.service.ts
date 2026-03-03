// src/services/workoutSession.service.ts

import { createAppError } from "@/middlewares/error.middleware";
import { exerciseRepository } from "@/repositories/exercise.repository";
import { workoutTemplateRepository } from "@/repositories/workoutTemplate.repository";
import { workoutSessionRepository } from "@/repositories/workoutSession.repository";
import {
	CreateWorkoutSessionInput,
	UpdateWorkoutSessionInput,
	WorkoutSessionFiltersInput
} from "@/schemas/workoutSession.schema";
import {
	WorkoutSession,
	WorkoutSessionWithExercises,
	WorkoutSessionCreateData,
	WorkoutSessionUpdateData,
	WorkoutSessionFilters,
	WorkoutSessionStats,
	WorkoutSessionWithMetrics
} from "@/types/entities/workoutSession.type";
import { handleServiceError } from "@/utils/error.utils";
import logger from "@/utils/logger";

//===========================================
// Helper Functions
//===========================================

/**
 * Validar que todos los ejercicios existen
 * @param exerciseIds array de ids de ejercicios
 * @returns Promise<void>
 */
const validateExercisesExist = async (exerciseIds: string[]): Promise<void> => {
	try {
		const uniqueIds = [ ...new Set(exerciseIds) ];

		for (const exerciseId of uniqueIds) {
			const exercise = await exerciseRepository.findById(exerciseId);

			if (!exercise) {
				throw createAppError(`Exercise not found: ${exerciseId}`, 404);
			}
		}
	} catch (error) {
		throw handleServiceError(
			error,
			'WorkoutSessionService.validateExercisesExist',
			'Unable to validate exercises',
			{ exerciseIds }
		);
	}
};

/**
 * Validar que el template existe (si se proporciona)
 * @param templateId id del template
 * @returns Promise<void>
 */
const validateTemplateExists = async (templateId: string): Promise<void> => {
	try {
		const template = await workoutTemplateRepository.findById(templateId);

		if (!template) {
			throw createAppError('Workout template not found', 404);
		}
	} catch (error) {
		throw handleServiceError(
			error,
			'WorkoutSessionService.validateTemplateExists',
			'Unable to validate template',
			{ templateId }
		);
	}
};

/**
 * Validar que la sesión existe y pertenece al usuario
 * @param sessionId id de la sesión
 * @param userId id del usuario
 * @returns Promise<WorkoutSession>
 */
const validateSessionOwnership = async (
	sessionId: string,
	userId: string
): Promise<WorkoutSession> => {
	try {
		const session = await workoutSessionRepository.findBaseSessionById(sessionId, userId);

		if (!session) {
			throw createAppError('Workout session not found', 404);
		}

		return session;
	} catch (error) {
		throw handleServiceError(
			error,
			'WorkoutSessionService.validateSessionOwnership',
			'Unable to validate session ownership',
			{ sessionId, userId }
		);
	}
};

/**
 * Sanitizar sesión
 * @param session sesión a sanitizar
 * @returns WorkoutSessionWithExercises
 */
const sanitizeSession = (
	session: WorkoutSessionWithExercises
): WorkoutSessionWithExercises => {
	return session;
};

//===========================================
// Workout Session Service
//===========================================

export const workoutSessionService = {
	/**
	 * Crear sesión de entrenamiento
	 * @param userId id del usuario
	 * @param input datos de la sesión (title, notes?, sessionDate, durationMinutes?, templateId?, exercises)
	 * @returns sesión creada con exercises y sets
	 */
	create: async (
		userId: string,
		input: CreateWorkoutSessionInput
	): Promise<WorkoutSessionWithExercises> => {
		try {
			// Validar template si se proporciona
			if (input.templateId) {
				await validateTemplateExists(input.templateId);
			}

			// Validar que todos los ejercicios existen
			const exerciseIds = input.exercises.map(e => e.exerciseId);
			await validateExercisesExist(exerciseIds);

			// Crear sesión
			const createData: WorkoutSessionCreateData = {
				userId,
				templateId: input.templateId,
				title: input.title,
				notes: input.notes,
				sessionDate: input.sessionDate,
				durationMinutes: input.durationMinutes,
				exercises: input.exercises,
			};

			const session = await workoutSessionRepository.create(createData);

			logger.info('Workout session created', {
				userId,
				sessionId: session.id,
				exerciseCount: input.exercises.length,
				templateId: input.templateId,
			});

			return sanitizeSession(session);
		} catch (error) {
			throw handleServiceError(
				error,
				'WorkoutSessionService.create',
				'Unable to create workout session',
				{ userId, input }
			);
		}
	},

	/**
	 * Obtener sesión por ID
	 * @param sessionId id de la sesión
	 * @param userId id del usuario
	 * @returns sesión con exercises y sets
	 */
	findById: async (
		sessionId: string,
		userId: string
	): Promise<WorkoutSessionWithExercises> => {
		await validateSessionOwnership(sessionId, userId);

		try {
			const session = await workoutSessionRepository.findById(sessionId, userId);

			if (!session) {
				throw createAppError('Workout session not found', 404);
			}

			return sanitizeSession(session);
		} catch (error) {
			throw handleServiceError(
				error,
				'WorkoutSessionService.findById',
				'Unable to retrieve workout session',
				{ sessionId, userId }
			);
		}
	},

	/**
	 * Listar sesiones con filtros
	 * @param userId id del usuario
	 * @param filters filtros (templateId?, startDate?, endDate?, searchTerm?)
	 * @param page página actual
	 * @param limit resultados por página
	 * @returns sesiones con paginación y métricas (totalExercises, totalSets, totalVolumeKg)
	 */
	findAll: async (
		userId: string,
		filters: WorkoutSessionFiltersInput = { page: 1, limit: 10 },
	): Promise<{
		sessions: WorkoutSessionWithMetrics[];
		total: number;
		page: number;
		totalPages: number;
	}> => {
		// Validación básica
		const page = filters.page < 1 ? 1 : filters.page;
		const limit = filters.limit < 1 || filters.limit > 100 ? 10 : filters.limit;

		const completeFilters: WorkoutSessionFilters = {
			userId: userId || undefined,
			templateId: filters?.templateId,
			startDate: filters?.startDate,
			endDate: filters?.endDate,
			searchTerm: filters?.searchTerm,
		};

		try {
			const [ sessions, total ] = await Promise.all([
				workoutSessionRepository.findAll(completeFilters, page, limit),
				workoutSessionRepository.count(completeFilters),
			]);

			const totalPages = Math.ceil(total / limit);

			return {
				sessions,
				total,
				page,
				totalPages,
			};
		} catch (error) {
			throw handleServiceError(
				error,
				'WorkoutSessionService.findAll',
				'Unable to retrieve workout sessions',
				{ userId, filters, page, limit }
			);
		}
	},

	/**
	 * Actualizar sesión
	 * @param sessionId id de la sesión
	 * @param userId id del usuario
	 * @param input datos a actualizar (title?, notes?, sessionDate?, durationMinutes?, exercises?)
	 * @returns sesión actualizada con exercises y sets
	 */
	update: async (
		sessionId: string,
		userId: string,
		input: UpdateWorkoutSessionInput
	): Promise<WorkoutSessionWithExercises> => {
		// Verificar que la sesión existe y pertenece al usuario
		await validateSessionOwnership(sessionId, userId);

		try {
			// Si se actualizan ejercicios, validar que existan
			if (input.exercises) {
				const exerciseIds = input.exercises.map(e => e.exerciseId);
				await validateExercisesExist(exerciseIds);
			}

			// Actualizar
			const updateData: WorkoutSessionUpdateData = {
				title: input.title,
				notes: input.notes,
				sessionDate: input.sessionDate,
				durationMinutes: input.durationMinutes,
				exercises: input.exercises,
			};

			const updated = await workoutSessionRepository.update(sessionId, userId, updateData);

			logger.info('Workout session updated', {
				userId,
				sessionId,
				updatedFields: Object.keys(input),
			});

			return sanitizeSession(updated);
		} catch (error) {
			throw handleServiceError(
				error,
				'WorkoutSessionService.update',
				'Unable to update workout session',
				{ sessionId, userId, input }
			);
		}
	},

	/**
	 * Eliminar sesión
	 * @param sessionId id de la sesión
	 * @param userId id del usuario
	 * @returns void
	 */
	delete: async (sessionId: string, userId: string): Promise<void> => {
		// Verificar que existe y pertenece al usuario
		await validateSessionOwnership(sessionId, userId);

		try {
			await workoutSessionRepository.delete(sessionId, userId);

			logger.info('Workout session deleted', {
				userId,
				sessionId,
			});
		} catch (error) {
			throw handleServiceError(
				error,
				'WorkoutSessionService.delete',
				'Unable to delete workout session',
				{ sessionId, userId }
			);
		}
	},

	/**
	 * Obtener estadísticas de sesiones del usuario
	 * @param userId id del usuario
	 * @returns totalSessions, totalDuration, averageDuration, sessionsThisWeek, sessionsThisMonth, mostUsedTemplate?
	 */
	getStats: async (userId: string): Promise<WorkoutSessionStats> => {
		try {
			const stats = await workoutSessionRepository.getStats(userId);

			return stats;
		} catch (error) {
			throw handleServiceError(
				error,
				'WorkoutSessionService.getStats',
				'Unable to retrieve session statistics',
				{ userId }
			);
		}
	},

	/**
	 * Crear sesión desde un template
	 * @param userId id del usuario
	 * @param templateId id del template
	 * @param sessionData datos adicionales (sessionDate, notes?, durationMinutes?)
	 * @returns sesión creada desde el template
	 */
	createFromTemplate: async (
		userId: string,
		templateId: string,
		sessionData: {
			sessionDate: Date;
			notes?: string;
			durationMinutes?: number;
		}
	): Promise<WorkoutSessionWithExercises> => {
		try {
			// get template with exercises 
			const template = await workoutTemplateRepository.findById(templateId);

			if (!template) {
				throw createAppError('Workout template not found', 404);
			}

			if (template.userId !== userId) {
				throw createAppError('Unauthorized to access this template', 403);
			}

			// Convertir exercises del template a formato de sesión
			const exercises = template.exercises.map(e => ({
				exerciseId: e.exerciseId,
				orderIndex: e.orderIndex,
				sets: Array.from({ length: e.suggestedSets || 3 }, (_, i) => ({
					setNumber: i + 1,
					reps: e.suggestedReps,
					durationSeconds: undefined,
					weight: undefined,
					restSeconds: undefined,
					notes: undefined,
				})),
			}));

			// Crear sesión
			const createData: WorkoutSessionCreateData = {
				userId,
				templateId,
				title: template.name,
				notes: sessionData.notes || template.description,
				sessionDate: sessionData.sessionDate,
				durationMinutes: sessionData.durationMinutes,
				exercises,
			};

			const session = await workoutSessionRepository.create(createData);

			logger.info('Workout session created from template', {
				userId,
				templateId,
				sessionId: session.id,
			});

			return sanitizeSession(session);
		} catch (error) {
			throw handleServiceError(
				error,
				'WorkoutSessionService.createFromTemplate',
				'Unable to create session from template',
				{ userId, templateId }
			);
		}
	},

	/**
	 * Obtener sesiones recientes del usuario
	 * @param userId id del usuario
	 * @param limit cantidad de sesiones a devolver
	 * @returns sesiones más recientes
	 */
	getRecent: async (
		userId: string,
		limit: number = 5
	): Promise<WorkoutSession[]> => {
		try {
			const filters: WorkoutSessionFilters = { userId };
			const sessions = await workoutSessionRepository.findAll(filters, 1, limit);

			return sessions;
		} catch (error) {
			throw handleServiceError(
				error,
				'WorkoutSessionService.getRecent',
				'Unable to retrieve recent sessions',
				{ userId, limit }
			);
		}
	},

	/**
	 * Obtener sesiones por rango de fechas
	 * @param userId id del usuario
	 * @param startDate fecha de inicio
	 * @param endDate fecha de fin
	 * @returns sesiones en el rango
	 */
	getByDateRange: async (
		userId: string,
		startDate: Date,
		endDate: Date
	): Promise<WorkoutSession[]> => {
		try {
			const filters: WorkoutSessionFilters = {
				userId,
				startDate,
				endDate,
			};

			const sessions = await workoutSessionRepository.findAll(filters, 1, 1000);

			return sessions;
		} catch (error) {
			throw handleServiceError(
				error,
				'WorkoutSessionService.getByDateRange',
				'Unable to retrieve sessions by date range',
				{ userId, startDate, endDate }
			);
		}
	},

	/**
	 * Duplicar sesión
	 * @param sessionId id de la sesión a duplicar
	 * @param userId id del usuario
	 * @param newDate nueva fecha para la sesión duplicada
	 * @returns sesión duplicada
	 */
	duplicate: async (
		sessionId: string,
		userId: string,
		newDate: Date
	): Promise<WorkoutSessionWithExercises> => {
		// Verificar que existe y pertenece al usuario
		await validateSessionOwnership(sessionId, userId);

		try {
			// Obtener sesión original
			const original = await workoutSessionRepository.findById(sessionId, userId);

			if (!original) {
				throw createAppError('Workout session not found', 404);
			}

			// Crear duplicado
			const createData: WorkoutSessionCreateData = {
				userId,
				templateId: original.templateId,
				title: `${original.title} (Copy)`,
				notes: original.notes,
				sessionDate: newDate,
				durationMinutes: original.durationMinutes,
				exercises: original.exercises.map(e => ({
					exerciseId: e.exerciseId,
					orderIndex: e.orderIndex,
					sets: e.sets.map(s => ({
						setNumber: s.setNumber,
						reps: s.reps,
						durationSeconds: s.durationSeconds,
						weight: s.weight,
						restSeconds: s.restSeconds,
						notes: s.notes,
					})),
				})),
			};

			const duplicated = await workoutSessionRepository.create(createData);

			logger.info('Workout session duplicated', {
				userId,
				originalId: sessionId,
				duplicatedId: duplicated.id,
			});

			return sanitizeSession(duplicated);
		} catch (error) {
			throw handleServiceError(
				error,
				'WorkoutSessionService.duplicate',
				'Unable to duplicate session',
				{ sessionId, userId }
			);
		}
	},
};