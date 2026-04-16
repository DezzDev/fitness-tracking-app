import {Router} from 'express'
import * as authController from '@/controllers/auth.controller'
import { requireAuth } from '@/middlewares/auth.middleware'

const router: Router = Router()

// ================================
// PUBLIC ROUTES
// ================================

/**
 * POST /auth/refresh
 * Refreshes the access token using the refresh token.
 */
router.post('/refresh', authController.refresh)

// ================================
// PROTECTED ROUTES
// ================================

/**
 * POST auth/logout
 * logout actual session
 */
router.post(
  '/logout', 
  requireAuth,
  authController.logout
) 

/**
 * POST /auth/logout-all
 * Logs out the user from all sessions by invalidating all refresh tokens.
 */
router.post(
  '/logout-all', 
  requireAuth,
  authController.logoutAll
)

export default router
 