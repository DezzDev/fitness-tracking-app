import { Router } from "express";
import { validateBody, validateParams } from "@/middlewares/validate.middleware";
import { RegisterSchema, LoginSchema, UpdateUserSchema, UserIdSchema } from "@/schemas/user.schema";

const router = Router();

// POST /users/register - Validar body
router.post(
	'/register',
	validateBody(RegisterSchema), // <- valida req.body
	userController.register
);

// POST /users/login - Validar body
router.post(
	'/login',
	validateBody(LoginSchema), // <- valida req.body
	userController.login
);

// Validar PARAMS(ID en la URL)

// PATCH /users/:id - Validar params
router.patch(
	'/:id',
	validateParams(UserIdSchema),  // ← Valida req.params.id
	validateBody(UpdateUserSchema), // ← Valida req.body
	userController.updateUser
);

// DELETE /users/:id
router.delete(
	'/:id',
	validateParams(UserIdSchema),
	userController.deleteUser
);

// Validar QUERY(Query String)
// GET /users?page=1&limit=10&role=admin

// router.get(
// 	'/',
// 	validateQuery(PaginationSchema),  // ← Valida req.query
// 	userController.listUsers
// );

export default router;