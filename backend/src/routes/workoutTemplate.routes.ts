import { createWorkoutTemplate } from "@/controllers/workoutTemplate.controller";
import { validateBody } from "@/middlewares/validate.middleware";
import { Router } from "express";
import { CreateWorkoutTemplateSchema } from "@/schemas/workoutTemplate.schema";
import { requireAuth } from "@/middlewares/auth.middleware";

const router: Router = Router();

// ============================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ============================================
router.use(requireAuth);


router.post(
	'/',
	validateBody(CreateWorkoutTemplateSchema),
	createWorkoutTemplate
);

export default router