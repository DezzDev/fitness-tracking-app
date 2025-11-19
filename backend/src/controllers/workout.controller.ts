// src/controllers/workout.controller.ts
import { Request, Response } from "express";
import { asyncHandler, createAppError } from "@/middlewares/error.middleware";
import { ResponseHandler } from "@/utils/response";
import { workoutService } from "@/services/workout.service";
import { CreateWorkoutInput, UpdateWorkoutInput } from "@/schemas/workout.schema";

// ============================================
// HELPERS
// ============================================

/**
 * Extraer userId del request
 * @param req request
 * @returns userId
 */
const getUserId = (req:Request): string =>{
	const userId = req.user?.userId;

	if (!userId) {
		throw createAppError('User ID not found in request', 400)
	}
	return userId;
}

/**
 * Extraer workoutId de params
 * @param params params del request
 * @returns workoutId
 */
const getWorkoutId = (params: Record<string, string | undefined>): string => {
	const {id} = params;

	if(!id){
		throw createAppError('Workout ID not found in request',400);
	}
	return id;
}

// ============================================
// WORKOUT CRUD CONTROLLERS
// ============================================

/**
 * POST /workouts
 * Crear nuevo workout
 */
export const createWorkout = asyncHandler(
	async(req:Request, res:Response):Promise<undefined> =>{
		const userId = getUserId(req);
		const data = req.validatedBody as CreateWorkoutInput;

		const workout = await workoutService.create(userId, data);
		ResponseHandler.created(res, workout, 'Workout created successfully');
	}
);

/**
 * GET /workouts/:id
 * Obtener workout por ID
 */
export const getWorkout = asyncHandler(
	async(req:Request, res:Response):Promise<undefined> =>{
		const userId = getUserId(req);
		const workoutId = getWorkoutId(req.params);

		const workout = await workoutService.findById(workoutId, userId);

		ResponseHandler.success(res, workout);
	}
)
 
/**
 * GET /workouts
 * Listar workouts del usuario
 */
export const listWorkouts = asyncHandler(
	async(req: Request, res: Response): Promise<undefined> => {
		const userId = getUserId(req);

		// Los filtros ya vienen validados por el middleware 
		const {page, limit, startDate, endDate, search} = req.query as any;

		const filters = {
			startDate,
			endDate,
			searchTerm: search,
		}

		const result = await workoutService.findAll(
			userId,
			filters,
			page ? parseInt(page): 1,
			limit ? parseInt(limit): 10
		)

		ResponseHandler.success(res,result);
	}
)

/**
 * PATCH /workouts/:id
 * Actualizar workout
 */
export const updateWorkout = asyncHandler(
	async(req: Request, res: Response): Promise<undefined> =>{
		const userId = getUserId(req);
		const workoutId = getWorkoutId(req.params);
		const data = req.validatedBody as UpdateWorkoutInput;

		const workout = await workoutService.update(workoutId, userId, data);

		ResponseHandler.success(res, workout, 'Workout updated successfully');
	}
)

/**
 * DELETE /workouts/id
 * Eliminar workout
 */
export const deleteWorkout = asyncHandler(
	async(req: Request, res:Response): Promise<undefined> =>{
		const userId = getUserId(req);
		const workoutId = getWorkoutId(req.params);

		await workoutService.delete(workoutId, userId);

		ResponseHandler.noContent(res);
	}
)

/**
 * GET /workouts/stats
 * Obtener estadísticas de workouts
 */
export const getWorkoutStats = asyncHandler(
	async(req:Request, res:Response):Promise<undefined> =>{
		const userId = getUserId(req);

		const {startDate, endDate} = req.query as any;

		const filters = {
			startDate,
			endDate
		};

		const stats = await workoutService.getStats(userId,filters)

		ResponseHandler.success(res, stats);
	}
)
