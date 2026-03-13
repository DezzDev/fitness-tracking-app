import { asyncHandler, createAppError } from "@/middlewares/error.middleware";
import {
	CreateWorkoutTemplateInput,
	UpdateWorkoutTemplateInput,
	WorkoutTemplateFiltersInput,
} from "@/schemas/workoutTemplate.schema";
import { Request, Response } from "express";
import { workoutTemplateService } from "@/services/workoutTemplate.service";
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
 * Extraer workoutTemplateId de params
 * @param params params del request
 * @returns workoutTemplateId
 */
const getWorkoutTemplateId = (params: Record<string, unknown> | undefined): string => {
	if (typeof params !== 'object' || !params?.id || typeof params.id !== 'string') {
		throw createAppError('Workout template ID not found in request', 400);
	}

	return params.id;
};

// ============================================
// CONTROLLERS
// ============================================

/**
 * Crear nuevo template de ejercicio
 */
export const createWorkoutTemplate = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const userId = getUserId(req);
		const data = req.validatedBody as CreateWorkoutTemplateInput;

		const workoutTemplate = await workoutTemplateService.create(userId, data);
		ResponseHandler.created(res, workoutTemplate, 'Workout template created successfully');
	}
);

/**
 * Obtener template por id
 */
export const getWorkoutTemplate = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const userId = getUserId(req);
		const templateId = getWorkoutTemplateId(req.validatedParams);

		const workoutTemplate = await workoutTemplateService.findById(templateId, userId);

		ResponseHandler.success(res, workoutTemplate, 'Workout template found successfully');
	}
);

/**
 * Listar templates del usuario
 */
export const listWorkoutTemplates = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const userId = getUserId(req);
		const filters = (req.validatedQuery ?? { page: 1, limit: 10 }) as WorkoutTemplateFiltersInput;

		const result = await workoutTemplateService.findAll(userId, filters);

		ResponseHandler.success(res, result, 'Workout templates retrieved successfully');
	}
);

/**
 * Actualizar template por id
 */
export const updateWorkoutTemplate = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const userId = getUserId(req);
		const templateId = getWorkoutTemplateId(req.validatedParams);
		const data = req.validatedBody as UpdateWorkoutTemplateInput;

		const workoutTemplate = await workoutTemplateService.update(templateId, userId, data);

		ResponseHandler.success(res, workoutTemplate, 'Workout template updated successfully');
	}
);

/**
 * Eliminar template por id
 */
export const deleteWorkoutTemplate = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const userId = getUserId(req);
		const templateId = getWorkoutTemplateId(req.validatedParams);

		await workoutTemplateService.delete(templateId, userId);

		ResponseHandler.noContent(res);
	}
);

/**
 * Duplicar template por id
 */
export const duplicateWorkoutTemplate = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const userId = getUserId(req);
		const templateId = getWorkoutTemplateId(req.validatedParams);

		const duplicatedTemplate = await workoutTemplateService.duplicate(templateId, userId);

		ResponseHandler.created(res, duplicatedTemplate, 'Workout template duplicated successfully');
	}
);

/**
 * Agregar/Quitar favorito de un template
 */
export const toggleWorkoutTemplateFavorite = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const userId = getUserId(req);
		const templateId = getWorkoutTemplateId(req.validatedParams);

		const updatedTemplate = await workoutTemplateService.toggleFavorite(templateId, userId);

		ResponseHandler.success(res, updatedTemplate, 'Workout template favorite toggled successfully');
	}
);

/**
 * Obtener templates programados para hoy
 */
export const getScheduledForToday = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const userId = getUserId(req);

		const templates = await workoutTemplateService.getScheduledForToday(userId);

		ResponseHandler.success(res, templates, 'Scheduled templates for today retrieved successfully');
	}
);

