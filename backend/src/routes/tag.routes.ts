// src/routes/tag.routes.ts
import { Router } from 'express';
import { validateBody, validateParams } from '@/middlewares/validate.middleware';
import { requireAuth } from '@/middlewares/auth.middleware';
import { authorize } from '@/middlewares/authorize.middleware';
import { CreateTagSchema, TagIdSchema } from '@/schemas/exercise.schema';
import * as exerciseController from '@/controllers/exercise.controller';

const router:Router = Router();

// ============================================
// PUBLIC ROUTES (lectura de tags)
// ============================================

/**
 * GET /tags
 * Listar todos los tags
 */
router.get('/', exerciseController.listTags);

/**
 * GET /tags/:id
 * Obtener tag especifico
 */
router.get('/:id', validateParams(TagIdSchema), exerciseController.getTag);

// ============================================
// ADMIN ROUTES (crear, eliminar tags)
// ============================================

/**
 * POST /tags
 * Crear nuevo tag (solo admin)
 */
router.post(
	'/',
	requireAuth,
	authorize('admin'),
	validateBody(CreateTagSchema),
	exerciseController.createTag
);

/**
 * DELETE /tags/:id
 * Eliminar tag (solo admin)
 */
router.delete(
	'/:id',
	requireAuth,
	authorize('admin'),
	validateParams(TagIdSchema),
	exerciseController.deleteTag
);

export default router;