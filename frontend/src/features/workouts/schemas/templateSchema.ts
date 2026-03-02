// src/features/workouts/schemas/templateSchemas.ts
import { z } from 'zod';

/**
 * Schema para un ejercicio en la plantilla
 */
export const templateExerciseSchema = z.object({
	exerciseId: z.uuid('El ID del ejercicio es requerido'),
	orderIndex: z.number().int().min(0),
	suggestedSets: z.number().int().min(1).max(10).optional(),
	suggestedReps: z.number().int().min(1).max(100).optional(),
	notes: z.string().max(500).optional(),
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
		.max(500, 'La descripción no puede exceder 500 caracteres')
		.optional(),

	exercises: z
		.array(templateExerciseSchema)
		.min(1, 'Agrega al menos 1 ejercicio'),
});

export type TemplateExerciseFormData = z.infer<typeof templateExerciseSchema>;
export type CreateTemplateFormData = z.infer<typeof createTemplateSchema>;
