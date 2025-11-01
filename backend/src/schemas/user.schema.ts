// src/schemas/user.schema.ts
import { z } from 'zod';

const profile_image_default = 'http://localhost:3000/public/images/default-avatar.jpg';

// Schema Base User
const BaseUserSchema = z.object({
	email: z
		.string({error:'Email is required'})
		.min(1, { message: 'Email is required' })
		.regex(z.regexes.email, { message: 'Invalid email address' })
		.toLowerCase()
		.trim(),
	
	password: z
		.string()
		.min(8, { message: 'Password must be at least 8 characters long' })
		.max(64, { message: 'Password must be at most 64 characters long' })
		.regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
		.regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
		.regex(/[0-9]/, { message: 'Password must contain at least one number' }),
				
});

// ============================================
// SCHEMAS ESPECÍFICOS
// ============================================

// Schema para registro (extiende el base)
export const RegisterSchema = BaseUserSchema.extend({
  name: z.string().min(2).max(50).trim(),
  age: z.number().int().min(15).max(120),
  role: z.enum(['user', 'admin']).default('user'),
	profile_image: z.string().optional().default(profile_image_default),
	acceptTerms: z.boolean().refine(val => val === true, { message: 'You must accept the terms and conditions' }),
});

// Schema para login (pick solo campos necesarios)
export const LoginSchema = BaseUserSchema.pick({
  email: true,
  password: true
});

// Schema para actualización (todos opcionales)
export const UpdateUserSchema = z.object({
	email: BaseUserSchema.shape.email.optional(),
  name: RegisterSchema.shape.name.optional(),
  age: RegisterSchema.shape.age.optional(),
	profile_image: z.string().optional(),
}).strict(); // No permite campos adicionales

// Schema para validar ID en params
export const UserIdSchema = z.object({
	id: z.uuid({ error: 'Invalid user ID format' })
});

// Schema para paginación
export const PaginationSchema = z.object({
	page: z
		.string()
		.default('1')
		.transform(Number)
		.pipe(z.number().int().min(1)),

	limit: z
		.string()
		.default('10')
		.transform(Number)
		.pipe(z.number().int().min(1).max(100)),
});

// Schema para cambio de contraseña
export const ChangePasswordSchema = z.object({
	oldPassword: z.string().min(1, 'Current password is required'),
	newPassword: BaseUserSchema.shape.password,
});

// Inferir tipos TypeScript
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UserIdParam = z.infer<typeof UserIdSchema>;
export type PaginationQuery = z.infer<typeof PaginationSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;