import { asyncHandler, createAppError } from "@/middlewares/error.middleware";
import { CreateWorkoutTemplateInput } from "@/schemas/workoutTemplate.schema";
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
		throw createAppError('User ID not found in request', 400)
	}
	return userId;
}

/**
 * Extraer workoutTemplateId de params
 * @param params params del request
 * @returns workoutTemplateId
 */
const getWorkoutTemplateId = (params: Record<string, unknown> | undefined): string => {
	if (typeof params !== 'object' || !params.id || typeof params.id !== 'string') {
		throw createAppError('Workout template ID not found in request', 400);
	}

	const { id } = params;

	return id;
}

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
)

/**
 * Obtener template por id
 */
export const getWorkoutTemplate = asyncHandler(
	async(req:Request, res:Response): Promise<undefined> =>{

		const userId = getUserId(req);
		const templateId = getWorkoutTemplateId(req.validatedParams);

		const workoutTemplate = await workoutTemplateService.findById(templateId, userId);

		ResponseHandler.success(res, workoutTemplate, 'Workout template found successfully');

	}
)