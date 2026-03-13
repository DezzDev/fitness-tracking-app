// src/features/workouts/schemas/templateSchema.ts
import { z } from 'zod';

/**
 * Schema para un set individual de plantilla
 */
export const templateSetSchema = z.object({
	setNumber: z
		.number({ error: 'El numero de serie es requerido' })
		.int('Debe ser un numero entero')
		.min(1, 'Minimo 1')
		.max(20, 'Maximo 20'),

	targetReps: z
		.number()
		.int('Debe ser un numero entero')
		.min(1, 'Minimo 1 rep')
		.max(500, 'Maximo 500 reps')
		.optional(),

	targetWeight: z
		.number()
		.nonnegative('El peso no puede ser negativo')
		.max(1000, 'Maximo 1000 kg')
		.optional(),

	targetDurationSeconds: z
		.number()
		.int('Debe ser un numero entero')
		.min(1, 'Minimo 1 segundo')
		.max(7200, 'Maximo 7200 segundos')
		.optional(),

	targetRestSeconds: z
		.number()
		.int('Debe ser un numero entero')
		.min(0, 'Minimo 0 segundos')
		.max(600, 'Maximo 600 segundos')
		.optional(),
});

/**
 * Schema para un ejercicio en la plantilla
 */
export const templateExerciseSchema = z.object({
	exerciseId: z.uuid('El ID del ejercicio es requerido'),
	orderIndex: z.number().int().min(0),
	suggestedSets: z.number().int().min(1).max(10).optional(),
	suggestedReps: z.number().int().min(1).max(100).optional(),
	notes: z.string().max(500).optional(),
	sets: z
		.array(templateSetSchema)
		.max(20, 'Maximo 20 series por ejercicio')
		.optional(),
});

/**
 * Schema para crear template
 */
export const createTemplateSchema = z.object({
	name: z
		.string()
		.min(1, 'El nombre es requerido')
		.min(3, 'El nombre debe tener al menos 3 caracteres')
		.max(100, 'El nombre no puede exceder 100 caracteres'),

	description: z
		.string()
		.max(500, 'La descripcion no puede exceder 500 caracteres')
		.optional(),

	scheduledDayOfWeek: z
		.number()
		.int()
		.min(0, 'Dia invalido')
		.max(6, 'Dia invalido')
		.optional(),

	exercises: z
		.array(templateExerciseSchema)
		.min(1, 'Agrega al menos 1 ejercicio'),
});

export type TemplateSetFormData = z.infer<typeof templateSetSchema>;
export type TemplateExerciseFormData = z.infer<typeof templateExerciseSchema>;
export type CreateTemplateFormData = z.infer<typeof createTemplateSchema>;
