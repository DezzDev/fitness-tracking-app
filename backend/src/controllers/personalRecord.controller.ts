// src/controllers/personalRecord.controller.ts
import { createAppError } from '@/middlewares/error.middleware';
import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/error.middleware';
import { CreatePersonalRecordInput, PersonalRecordFiltersInput, UpdatePersonalRecordInput } from '@/schemas/personalRecord.schema';
import { personalRecordService } from '@/services/personalRecord.service';
import { ResponseHandler } from '@/utils/response';


//===========================================
// Helpers
//===========================================

const getUserId = (req: Request): string =>{
	const userId = req.user?.userId

	if(!userId){
		throw createAppError('User Id not found in request', 400)
	}
	return userId;
}

const extractRecordId = (params: Record<string, string | undefined>): string =>{
	const {id} = params;
	if(!id){
		throw createAppError('Personal record ID not found in request', 400);
	}
	return id;
}

//===========================================
// Controllers
//===========================================

/**
 * POST /personal-records
 * Crear o actualizar personal record
 */
export const createOrUpdatePersonalRecord = asyncHandler(
	async (req:Request, res: Response): Promise<undefined> => {
		const userId = getUserId(req)
		const data = req.validatedBody as CreatePersonalRecordInput;

		const result = await personalRecordService.createOrUpdate(userId, data);

		if(result.isNew) {
			ResponseHandler.created(
				res,
				result.record,
				'Personal record created successfully'
			);
		}else if (result.improved){
			ResponseHandler.success(res, result.record, 'Personal record updated successfully');
		} else {
			ResponseHandler.success(
				res,
				result.record,
				'No improvement. Current record maintained'
			)
		}
	} 
)

/**
 * GET /personal-records/:id
 * Obtener PR por ID
 */
export const getPersonalRecord = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const userId = getUserId(req)
		const recordId = extractRecordId(req.validatedParams as {id: string})

		const record = await personalRecordService.findById(userId, recordId);

		ResponseHandler.success(res, record);
	}
)

/**
 * GET /personal-records/exercise/:exerciseId
 * Obtener PR de un ejercicio especifico
 */
export const getPersonalRecordByExercise = asyncHandler(
	async (req: Request, res: Response): Promise<undefined> => {
		const userId = getUserId(req)
		const {exerciseId} = req.params;

		if(!exerciseId){
			throw createAppError('Exercise ID is required', 400);
		}

		const record = await personalRecordService.findByExercise(userId, exerciseId);

		if(!record){
			ResponseHandler.success(
				res,
				null,
				'No personal record found for this exercise'
			)
			return;
		}

		ResponseHandler.success(res,record)
	}
)

/**
 * GET /personal-records
 * Listar PRs del usuario
 */
export const listPersonalRecords = asyncHandler(
	async(req: Request, res: Response): Promise<undefined> => {
		const userId = getUserId(req);
		const {page, limit, exerciseId, muscleGroup, difficulty, type} = req.query as unknown as PersonalRecordFiltersInput;

		const filters = {
			exerciseId,
			muscleGroup,
			difficulty,
			type
		}

		const result = await personalRecordService.findAll(
			userId,
			filters,
			page ? Number(page): 1,
			limit ? Number(limit): 10
		)
		ResponseHandler.success(res, result);
	}
)

/**
 * PATCH /personal-records/:id
 * Actualizar PR manualmente
 */
export const updatePersonalRecord = asyncHandler(
	async(req: Request, res: Response): Promise<undefined> =>{
		const userId = getUserId(req);
		const recordId = extractRecordId(req.params);
		const data = req.validatedBody as UpdatePersonalRecordInput;

		const record = await personalRecordService.update(recordId, userId, data);

		ResponseHandler.success(res, record, 'Personal record updated successfully');

	}
)

/**
 * DELETE /personal-records/:id
 * Eliminar PR
 */
export const deletePersonalRecord = asyncHandler(
	async(req: Request, res:Response): Promise<undefined> =>{
		const userId = getUserId(req);
		const recordId = extractRecordId(req.params);

		await personalRecordService.delete(recordId, userId);

		ResponseHandler.noContent(res);
	}
)

/**
 * GET /personal-records/stats
 * Obtener estadísticas de PRs
 */
export const getPersonalRecordStats = asyncHandler(
	async(req:Request, res:Response):Promise<undefined> =>{
		const userId = getUserId(req);

		const stats = await personalRecordService.getStats(userId);

		ResponseHandler.success(res, stats);
	}
)
 



