// src/controllers/exercise.controller.ts
import { Request, Response } from 'express';
import { createAppError } from '@/middlewares/error.middleware';
import { exerciseService, tagService  } from '@/services/exercise.service';
import { asyncHandler } from '@/middlewares/error.middleware';
import { ResponseHandler } from '@/utils/response';
import {
	CreateExerciseInput,
	UpdateExerciseInput,
	CreateTagInput
} from '@/schemas/exercise.schema';

// ============================================
//  HELPERS 
// ============================================

/**
 * Extraer exerciseId de params
 * @param params params del request
 * @returns exerciseId
 */
const extractExerciseId = (params: Record<string, string | undefined>): string => {
	const { id } = params;

	if (!id) {
		throw createAppError('Exercise ID is required', 400);
	}
	return id;
};

/**
 * Extraer tagId de params
 * @param params params del request
 * @returns tagId
 */
const extractTagId = (params: Record<string, string | undefined>): string => {
	const { tagId } = params;

	if (!tagId) {
		throw createAppError('Tag ID is required', 400);
	}
	return tagId;
};


// ============================================
// EXERCISE CONTROLLERS
// ============================================

/**
 * POST /exercises
 * Crear nuevo ejercicio
 */
export const createExercise = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const data = req.validatedBody as CreateExerciseInput;

		const exercise = await exerciseService.create(data);
		ResponseHandler.created(res, exercise, 'Exercise created successfully');
	}
)

/**
 * GET /exercises/:id
 * Obtener exercise por ID
 */
export const getExercise = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const exerciseId = extractExerciseId(req.validatedParams as Record<string, string>);

		const exercise = await exerciseService.findById(exerciseId);

		ResponseHandler.success(res, exercise);
	}
);

/**
 * GET /exercises
 * Listar ejercicios con filtros
 */
export const listExercises = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		// Los filtros ya vienen validados por el middleware
		const {
			page,
			limit,
			difficulty,
			muscleGroup,
			type,
			tagIds,
			searchTerm
		} = req.query as any

		const filters = {
			difficulty,
			muscleGroup,
			type,
			tagIds,
			searchTerm
		}

		const result = await exerciseService.findAll(
			filters,
			page ? parseInt(page) : 1,
			limit ? parseInt(limit) : 10
		)

		ResponseHandler.success(res, result);
	}
)

/**
 * PATCH /exercises/:id
 * Actualizar ejercicio
 */
export const updateExercise = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const exerciseId = extractExerciseId(req.validatedParams as Record<string, string>);
		const data = req.validatedBody as UpdateExerciseInput;

		const exercise = await exerciseService.update(exerciseId, data);

		ResponseHandler.success(res, exercise, 'Exercise updated successfully');

	}
)

/**
 * DELETE /exercises/:id
 * Eliminar ejercicio
 */
export const deleteExercise = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const exerciseId = extractExerciseId(req.validatedParams as Record<string, string>);

		await exerciseService.delete(exerciseId);

		ResponseHandler.noContent(res);
	}
)

/**
 * GET Exercises/stats
 */
export const getExerciseStats = asyncHandler(
	async (_: Request, res: Response): Promise<undefined> => {
		const stats = await exerciseService.getStats();

		ResponseHandler.success(res, stats);
	}
)

// ============================================
// TAG CONTROLLERS
// ============================================

/**
 * POST /tags
 * Crear nueva etiqueta
 */
export const createTag = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const data = req.validatedBody as CreateTagInput;

		const tag = await tagService.create(data);

		ResponseHandler.created(res, tag, 'Tag created successfully');	
	}
);

/**
 * GET /tags/:id
 * Obtener etiqueta por ID
 */
export const getTag = asyncHandler(
	async(req:Request, res:Response): Promise<undefined> =>{
		const tagId = extractTagId(req.validatedParams as Record<string, string>);

		const tag = await tagService.findById(tagId);

		ResponseHandler.success(res, tag);
	}
);

/**
 * GET /tags
 * Listar todos los tags
 */
export const listTags = asyncHandler(
	async(_:Request, res:Response): Promise<undefined> => {
		const tags = await tagService.findAll();

		ResponseHandler.success(res, tags);
	}
);

/**
 * DELETE /tags/:id
 * Eliminar etiqueta
 */
export const deleteTag = asyncHandler(
	async(req:Request, res: Response): Promise<undefined> =>{
		const tagId = extractTagId(req.validatedParams as Record<string, string>);

		await tagService.delete(tagId);

		ResponseHandler.noContent(res);
	}
)
