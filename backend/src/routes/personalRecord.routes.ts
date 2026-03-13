// src/routes/PersonalRecords.routes.ts
import { requireAuth } from '@/middlewares/auth.middleware';
import { Router } from 'express';
import * as personalRecordController from '@/controllers/personalRecord.controller';
import { CreatePersonalRecordSchema, PersonalRecordFiltersSchema, PersonalRecordIdSchema, UpdatePersonalRecordSchema } from '@/schemas/personalRecord.schema';
import { validateBody, validateParams, validateQuery } from '@/middlewares/validate.middleware';
import { ExerciseIdSchema } from '@/schemas/exercise.schema';

const router: Router = Router();

//==========================================
// Todas las rutas requieren autenticación
//==========================================

router.use(requireAuth)

//==========================================
// Personal Records Routes
//==========================================

/**
 * GET /personal-records/stats
 * Obtener estadísticas de PRs del usuario
 * Notal: Esta ruta debe ir Antes de /personal-records/:id
 */
router.get('/stats', personalRecordController.getPersonalRecordStats)

/**
 * POST /personal-records
 * Crear o actualizar personal record
 */
router.post(
	'/',
	validateBody(CreatePersonalRecordSchema),
	personalRecordController.createOrUpdatePersonalRecord
)

/**
 * GET /personal-records
 * Listar PRs del usuario con filtros
 */
router.get(
	'/',
	validateQuery(PersonalRecordFiltersSchema),
	personalRecordController.listPersonalRecords
)

/**
 * GET /personal-records/exercise/:exerciseId
 * Obtener PRs de un ejercicio específico
 */
router.get(
	'/exercise/:exerciseId',
	validateParams(ExerciseIdSchema),
	personalRecordController.getPersonalRecordByExercise
)

/**
 * GET /personal-records/:id
 * Obtener PR por ID
 */
router.get(
	'/:id',
	validateParams(PersonalRecordIdSchema),
	personalRecordController.getPersonalRecord
)

/**
 * PATCH /personal-records/:id
 * Actualizar PR manualmente
 */
router.patch(
	'/:id',
	validateParams(PersonalRecordIdSchema),
	validateBody(UpdatePersonalRecordSchema),
	personalRecordController.updatePersonalRecord
)

/**
 * DELETE /personal-records/:id
 * Eliminar PR
 */
router.delete(
	'/:id',
	validateParams(PersonalRecordIdSchema),
	personalRecordController.deletePersonalRecord
)

export default router;
