// src/controllers/workoutSession.controller.ts

import { asyncHandler, createAppError } from "@/middlewares/error.middleware";
import {
	CreateWorkoutSessionInput,
	UpdateWorkoutSessionInput,
	WorkoutSessionFiltersInput,
	CreateFromTemplateInput,
	DuplicateSessionInput,
	DateRangeInput,
} from "@/schemas/workoutSession.schema";
import { Request, Response } from "express";
import { workoutSessionService } from "@/services/workoutSession.service";
import { ResponseHandler } from "@/utils/response";

// ============================================
// HELPERS
// ============================================

/**
 * Extraer userId del request
 * @param req request
 * @returns userId
 */
const getUserId = (req: Request): string => {
	const userId = req.user?.userId;

	if (!userId) {
		throw createAppError('User ID not found in request', 400);
	}
	return userId;
};

/**
 * Extraer sessionId de params
 * @param params params del request
 * @returns sessionId
 */
const getSessionId = (params: Record<string, unknown> | undefined): string => {
	if (typeof params !== 'object' || !params?.id || typeof params.id !== 'string') {
		throw createAppError('Workout session ID not found in request', 400);
	}

	return params.id;
};

// ============================================
// CONTROLLERS
// ============================================

/**
 * Crear nueva sesión de entrenamiento
 */
export const createWorkoutSession = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const userId = getUserId(req);
		const data = req.validatedBody as CreateWorkoutSessionInput;

		const session = await workoutSessionService.create(userId, data);
		ResponseHandler.created(res, session, 'Workout session created successfully');
	}
);

/**
 * Obtener sesión por id
 */
export const getWorkoutSession = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const userId = getUserId(req);
		const sessionId = getSessionId(req.validatedParams);

		const session = await workoutSessionService.findById(sessionId, userId);

		ResponseHandler.success(res, session, 'Workout session found successfully');
	}
);

/**
 * Listar sesiones del usuario
 */
export const listWorkoutSessions = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const userId = getUserId(req);
		const filters = (req.validatedQuery ?? { page: 1, limit: 10 }) as WorkoutSessionFiltersInput;

		const result = await workoutSessionService.findAll(userId, filters);

		ResponseHandler.success(res, result, 'Workout sessions retrieved successfully');
	}
);

/**
 * Actualizar sesión por id
 */
export const updateWorkoutSession = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const userId = getUserId(req);
		const sessionId = getSessionId(req.validatedParams);
		const data = req.validatedBody as UpdateWorkoutSessionInput;

		const session = await workoutSessionService.update(sessionId, userId, data);

		ResponseHandler.success(res, session, 'Workout session updated successfully');
	}
);

/**
 * Eliminar sesión por id
 */
export const deleteWorkoutSession = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const userId = getUserId(req);
		const sessionId = getSessionId(req.validatedParams);

		await workoutSessionService.delete(sessionId, userId);

		ResponseHandler.noContent(res);
	}
);

/**
 * Obtener estadísticas de sesiones del usuario
 */
export const getWorkoutSessionStats = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const userId = getUserId(req);

		const stats = await workoutSessionService.getStats(userId);

		ResponseHandler.success(res, stats, 'Workout session statistics retrieved successfully');
	}
);

/**
 * Crear sesión desde un template
 */
export const createSessionFromTemplate = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const userId = getUserId(req);
		const data = req.validatedBody as CreateFromTemplateInput;

		const session = await workoutSessionService.createFromTemplate(
			userId,
			data.templateId,
			{
				sessionDate: data.sessionDate,
				notes: data.notes,
				durationMinutes: data.durationMinutes,
			}
		);

		ResponseHandler.created(res, session, 'Workout session created from template successfully');
	}
);

/**
 * Duplicar sesión por id
 */
export const duplicateWorkoutSession = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const userId = getUserId(req);
		const sessionId = getSessionId(req.validatedParams);
		const data = req.validatedBody as DuplicateSessionInput;

		const duplicated = await workoutSessionService.duplicate(sessionId, userId, data.newDate);

		ResponseHandler.created(res, duplicated, 'Workout session duplicated successfully');
	}
);

/**
 * Obtener sesiones recientes del usuario
 */
export const getRecentWorkoutSessions = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const userId = getUserId(req);
		const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

		const sessions = await workoutSessionService.getRecent(userId, limit);

		ResponseHandler.success(res, sessions, 'Recent workout sessions retrieved successfully');
	}
);

/**
 * Obtener sesiones por rango de fechas
 */
export const getSessionsByDateRange = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const userId = getUserId(req);
		const data = req.validatedQuery as DateRangeInput;

		const sessions = await workoutSessionService.getByDateRange(
			userId,
			data.startDate,
			data.endDate
		);

		ResponseHandler.success(res, sessions, 'Workout sessions by date range retrieved successfully');
	}
);