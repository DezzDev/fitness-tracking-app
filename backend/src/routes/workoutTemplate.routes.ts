import {
	createWorkoutTemplate,
	deleteWorkoutTemplate,
	duplicateWorkoutTemplate,
	getScheduledForToday,
	getWorkoutTemplate,
	listWorkoutTemplates,
	toggleWorkoutTemplateFavorite,
	updateWorkoutTemplate,
} from "@/controllers/workoutTemplate.controller";
import { validateBody, validateParams, validateQuery } from "@/middlewares/validate.middleware";
import { Router } from "express";
import {
	CreateWorkoutTemplateSchema,
	UpdateWorkoutTemplateSchema,
	WorkoutTemplateFiltersSchema,
	WorkoutTemplateIdSchema,
} from "@/schemas/workoutTemplate.schema";
import { requireAuth } from "@/middlewares/auth.middleware";

const router: Router = Router();

// ============================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ============================================
router.use(requireAuth);

/**
 * POST /workoutTemplates
 * Crear nuevo workout template
 */
router.post(
	'/',
	validateBody(CreateWorkoutTemplateSchema),
	createWorkoutTemplate
);

/**
 * GET /workoutTemplates
 * Listar templates del usuario con filtros
 */
router.get(
	'/',
	validateQuery(WorkoutTemplateFiltersSchema),
	listWorkoutTemplates
);

/**
 * GET /workoutTemplates/today
 * Obtener templates programados para hoy
 */
router.get(
	'/today',
	getScheduledForToday
);

/**
 * GET /workoutTemplates/:id
 * Obtener template por id
 */
router.get(
	'/:id',
	validateParams(WorkoutTemplateIdSchema),
	getWorkoutTemplate
);

/**
 * PATCH /workoutTemplates/:id
 * Actualizar template por id
 */
router.patch(
	'/:id',
	validateParams(WorkoutTemplateIdSchema),
	validateBody(UpdateWorkoutTemplateSchema),
	updateWorkoutTemplate
);

/**
 * DELETE /workoutTemplates/:id
 * Eliminar template por id
 */
router.delete(
	'/:id',
	validateParams(WorkoutTemplateIdSchema),
	deleteWorkoutTemplate
);

/**
 * POST /workoutTemplates/:id/duplicate
 * Duplicar template por id
 */
router.post(
	'/:id/duplicate',
	validateParams(WorkoutTemplateIdSchema),
	duplicateWorkoutTemplate
);

/**
 * PATCH /workoutTemplates/:id/favorite
 * Agregar/Quitar favorito de un template
 */
router.patch(
	'/:id/favorite',
	validateParams(WorkoutTemplateIdSchema),
	toggleWorkoutTemplateFavorite
);

export default router;
