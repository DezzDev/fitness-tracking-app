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

export const createWorkoutTemplate = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		
		const userId = getUserId(req);
		const data = req.validatedBody as CreateWorkoutTemplateInput;

		const workoutTemplate = await workoutTemplateService.create(userId, data);
		ResponseHandler.created(res, workoutTemplate, 'Workout template created successfully');

	}
)