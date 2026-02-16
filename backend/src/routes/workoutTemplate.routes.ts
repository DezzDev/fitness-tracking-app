import { createWorkoutTemplate, getWorkoutTemplate } from "@/controllers/workoutTemplate.controller";
import { validateBody, validateParams } from "@/middlewares/validate.middleware";
import { Router } from "express";
import { CreateWorkoutTemplateSchema, WorkoutTemplateIdSchema } from "@/schemas/workoutTemplate.schema";
import { requireAuth } from "@/middlewares/auth.middleware";

const router: Router = Router();

// ============================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ============================================
router.use(requireAuth);

/**
 * Crear nuevo workout template
 */
router.post(
	'/',
	validateBody(CreateWorkoutTemplateSchema),
	createWorkoutTemplate
);

/**
 * Obtener template por id
 */
router.get(
	'/:id',
	validateParams(WorkoutTemplateIdSchema),
	getWorkoutTemplate,

)



export default router