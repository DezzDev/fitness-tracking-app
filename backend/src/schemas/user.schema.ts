// src/schemas/user.schema.ts
import { z } from 'zod';

// Schema Base User
const BaseUserSchema = z.object({
	email: z
		.string()
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
  age: z.number().int().min(18).max(120),
  role: z.enum(['user', 'admin']).default('user'),
  acceptTerms: z.boolean().refine(val => val === true, { message: 'You must accept the terms and conditions' }),
});

// Schema para login (pick solo campos necesarios)
export const LoginSchema = BaseUserSchema.pick({
  email: true,
  password: true
});

// Schema para actualización (todos opcionales)
export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(50).trim().optional(),
  age: z.number().int().min(18).max(120).optional(),
  bio: z.string().max(500).optional()
}).strict(); // No permite campos adicionales

// Schema para validar ID en params
export const UserIdSchema = z.object({
	id: z.uuid({ message: 'Invalid user ID format' })
});

// Inferir tipos TypeScript
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;