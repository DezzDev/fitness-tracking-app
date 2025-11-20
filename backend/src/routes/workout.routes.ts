// src/routes/workout.routes.ts
import { Router } from "express";
import {validateBody, validateParams, validateQuery} from "@/middlewares/validate.middleware";
import { requireAuth } from "@/middlewares/auth.middleware";
import {
	CreateWorkoutSchema,
	UpdateWorkoutSchema,
	WorkoutIdSchema,
	WorkoutFiltersSchema,
} from '@/schemas/workout.schema';
import * as workoutController from "@/controllers/workout.controller";

const router: Router = Router();

// ============================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ============================================
router.use(requireAuth);

// ============================================
// WORKOUT ROUTES
// ============================================

/**
 * GET /workouts/stats
 * Obtener estadísticas de workouts del usuario
 * NOTA: Esta ruta debe ir ANTES de /workouts/:id para evitar conflictos
 */
router.get(
	'/stats', 
	validateQuery(WorkoutFiltersSchema), 
	workoutController.getWorkoutStats
)

/**
 * POST /workouts
 * Crear nuevo workout
 */
router.post(
	'/', 
	validateBody(CreateWorkoutSchema),
	workoutController.createWorkout
)

/**
 * GET /workouts
 * Listar workouts del usuario con filtros
 */
router.get(
	'/',
	validateQuery(WorkoutFiltersSchema),
	workoutController.listWorkouts
)

/**
 * GET /workouts/:id
 * Obtener workout específico
 */
router.get(
	'/:id', 
	validateParams(WorkoutIdSchema),
	workoutController.getWorkout	
)

/**
 * PATCH /workouts/:id
 * Actualizar workout
 */
router.patch(
	'/:id',
	validateParams(WorkoutIdSchema),
	validateBody(UpdateWorkoutSchema),
	workoutController.updateWorkout
)

/**
 * DELETE /workouts/:id
 * Eliminar workout
 */
router.delete(
	'/:id',
	validateParams(WorkoutIdSchema),
	workoutController.deleteWorkout
)

export default router;
