// src/routes/workoutSession.routes.ts

import { Router } from 'express';
import { requireAuth } from '@/middlewares/auth.middleware';
import { validateBody, validateParams, validateQuery } from '@/middlewares/validate.middleware';
import {
	CreateWorkoutSessionSchema,
	UpdateWorkoutSessionSchema,
	WorkoutSessionIdSchema,
	WorkoutSessionFiltersSchema,
	CreateFromTemplateSchema,
	DuplicateSessionSchema,
	DateRangeSchema,
} from '@/schemas/workoutSession.schema';
import {
	createWorkoutSession,
	getWorkoutSession,
	listWorkoutSessions,
	updateWorkoutSession,
	deleteWorkoutSession,
	getWorkoutSessionStats,
	createSessionFromTemplate,
	duplicateWorkoutSession,
	getRecentWorkoutSessions,
	getSessionsByDateRange,
} from '@/controllers/workoutSession.controller';

const router:Router = Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

// ============================================
// RUTAS DE STATS Y UTILIDADES (antes de :id)
// ============================================

/**
 * GET /sessions/stats
 * Obtener estadísticas de sesiones del usuario
 */
router.get('/stats', getWorkoutSessionStats);

/**
 * GET /sessions/recent
 * Obtener sesiones recientes del usuario
 */
router.get('/recent', getRecentWorkoutSessions);

/**
 * GET /sessions/date-range
 * Obtener sesiones por rango de fechas
 */
router.get(
	'/date-range',
	validateQuery(DateRangeSchema),
	getSessionsByDateRange
);

/**
 * POST /sessions/from-template
 * Crear sesión desde un template
 */
router.post(
	'/from-template',
	validateBody(CreateFromTemplateSchema),
	createSessionFromTemplate
);

// ============================================
// RUTAS CRUD PRINCIPALES
// ============================================

/**
 * POST /sessions
 * Crear nueva sesión de entrenamiento
 */
router.post(
	'/',
	validateBody(CreateWorkoutSessionSchema),
	createWorkoutSession
);

/**
 * GET /sessions
 * Listar sesiones del usuario con filtros
 */
router.get(
	'/',
	validateQuery(WorkoutSessionFiltersSchema),
	listWorkoutSessions
);

/**
 * GET /sessions/:id
 * Obtener sesión por id
 */
router.get(
	'/:id',
	validateParams(WorkoutSessionIdSchema),
	getWorkoutSession
);

/**
 * PATCH /sessions/:id
 * Actualizar sesión por id
 */
router.patch(
	'/:id',
	validateParams(WorkoutSessionIdSchema),
	validateBody(UpdateWorkoutSessionSchema),
	updateWorkoutSession
);

/**
 * DELETE /sessions/:id
 * Eliminar sesión por id
 */
router.delete(
	'/:id',
	validateParams(WorkoutSessionIdSchema),
	deleteWorkoutSession
);

/**
 * POST /sessions/:id/duplicate
 * Duplicar sesión por id
 */
router.post(
	'/:id/duplicate',
	validateParams(WorkoutSessionIdSchema),
	validateBody(DuplicateSessionSchema),
	duplicateWorkoutSession
);

export default router;