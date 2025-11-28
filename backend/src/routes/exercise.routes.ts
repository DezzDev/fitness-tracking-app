// src/routes/exercise.routes.ts
import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '@/middlewares/validate.middleware';
import { requireAuth } from '@/middlewares/auth.middleware';
import { authorize } from '@/middlewares/authorize.middleware';
import {
	CreateExerciseSchema,
	UpdateExerciseSchema,
	ExerciseIdSchema,
	ExerciseFiltersSchema,
} from '@/schemas/exercise.schema';
import * as exerciseController from '@/controllers/exercise.controller';

const router:Router = Router();

// ============================================
// PUBLIC ROUTES (lectura de exercises)
// ============================================

/**
 * GET /exercises/stats
 * Obtener estadísticas de los exercises
 * NOTA: Esta ruta debe ir antes de /exercises/:id
 */
router.get('/stats', exerciseController.getExerciseStats);

/**
 * GET /exercises
 * Listar exercises con filtros
 */
router.get(
	'/', 
	validateQuery(ExerciseFiltersSchema),
	exerciseController.listExercises
);

/**
 * GET /exercises/:id
 * Obtener exercise especifico
 */
router.get(
	'/:id', 
	validateParams(ExerciseIdSchema),
	exerciseController.getExercise
);

// ============================================
// ADMIN ROUTES (crear, actualizar, eliminar exercises)
// ============================================

/**
 * POST /exercises
 * Crear nuevo exercise (solo admin)
 */
router.post(
	'/',
	requireAuth,
	authorize('admin'),
	validateBody(CreateExerciseSchema),
	exerciseController.createExercise
);

/**
 * PATCH /exercises/:id
 * Actualizar exercise (solo admin)
 */
router.patch(
	'/:id',
	requireAuth,
	authorize('admin'),
	validateParams(ExerciseIdSchema),
	validateBody(UpdateExerciseSchema),
	exerciseController.updateExercise
);

/**
 * DELETE /exercises/:id
 * Eliminar exercise (solo admin)
 */
router.delete(
	'/:id',
	requireAuth,
	authorize('admin'),
	validateParams(ExerciseIdSchema),
	exerciseController.deleteExercise
);

export default router;