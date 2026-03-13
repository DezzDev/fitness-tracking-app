import { z } from 'zod';

// const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"
// const profile_image_default = `${BASE_URL}/public/images/default-avatar.jpg`;
/**
 * Schema para Login
 */
export const baseUserSchema = z.object({
	email: z
		.string({ error: 'Email is required' })
		.min(1, { error: 'Email is required' })
		.regex(z.regexes.email, { error: 'Invalid email address' })
		.toLowerCase()
		.trim(),

	password: z
		.string()
		.min(8, { error: 'Password must be at least 8 characters long' })
		.max(64, { error: 'Password must be at most 64 characters long' })
		.regex(/[a-z]/, { error: 'Password must contain at least one lowercase letter' })
		.regex(/[A-Z]/, { error: 'Password must contain at least one uppercase letter' })
		.regex(/[0-9]/, { error: 'Password must contain at least one number' }),
})

/**
 * Schema para Login
 */
export const loginSchema = baseUserSchema.pick({
	email: true,
	password: true
})

/**
 * Schema para Register
 */
export const registerSchema = baseUserSchema.extend({
	name: z
		.string()
		.min(2, 'El nombre debe tener al menos 2 caracteres')
		.max(50, 'El nombre no puede tener más de 50 caracteres')
		.trim(),
	age: z
		.number('La edad debe de ser un número')
		.int('La edad debe de ser un número entero')
		.min(15, 'Debes tener al menos 15 años')
		.max(120, 'Edad inválida'),
	acceptTerms: z.boolean().refine((val: boolean) => val === true, { error: 'You must accept the terms and conditions' }),
	confirmPassword: z.string().min(1, { error: 'Confirm password is required' }),
	role: z.enum([ 'user', 'admin' ]),
	profile_image: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword,{
	error: 'Passwords do not match',
	path: ['confirmPassword']
})

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
// export type RegisterFormValues = z.input<typeof registerSchema>;
