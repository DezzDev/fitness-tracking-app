// src/schemas/exercise.schema.ts
import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export const ExerciseDifficultyEnum = z.enum([
	'beginner',
	'intermediate',
	'advanced'
]);
export const ExerciseTypeEnum = z.enum([
	'fuerza',
	'resistencia',
	'skill',
	'explosivo', 
  'isométrico',
  'mobilidad',
  'cardio',
]);

// ============================================
// CREATE EXERCISE SCHEMA
// ============================================

export const CreateExerciseSchema = z.object({
	name: z
		.string({ error: 'Name is required' })
		.min(3, { error: 'Name must be at least 3 characters' })
		.max(100, { error: 'Name must be at most 100 characters' })
		.trim(),

	description: z
		.string()
		.max(1000, {error: 'Description must be at most 1000 characters'})
		.trim()
		.optional(),

	difficulty: ExerciseDifficultyEnum.optional(),

	muscleGroup: z
		.string()
		.min(2, {error: 'Muscle group must be at least 2 characters'})
		.max(50, {error: 'Muscle group must be at most 50 characters'})
		.trim()
		.optional(),

	type: ExerciseTypeEnum.optional(),

	tagIds: z
		.array(z.uuidv4('Invalid tag ID format'))
		.max(20, {error: 'Cannot have more than 20 tags'})
		.optional(),
})

// ============================================
// UPDATE EXERCISE SCHEMA
// ============================================

export const UpdateExerciseSchema = z.object({
	name: CreateExerciseSchema.shape.name.optional(),
	description: CreateExerciseSchema.shape.description.optional(),
	difficulty: CreateExerciseSchema.shape.difficulty.optional(),
	muscleGroup: CreateExerciseSchema.shape.muscleGroup.optional(),
	type: CreateExerciseSchema.shape.type.optional(),
	tagIds: CreateExerciseSchema.shape.tagIds.optional(),
}).strict(); // No permite campos adicionales

// ============================================
// EXERCISE ID PARAM SCHEMA
// ============================================

export const ExerciseIdSchema = z.object({
	id: z.uuid({ error: 'Invalid exercise ID format' })
})

// ============================================
// EXERCISE FILTERS SCHEMA (QUERY PARAMS)
// ============================================

export const ExerciseFiltersSchema = z.object({
	page: z.string().default('1').transform(Number).pipe(z.number().int().min(1)),
	limit: z.string().default('10').transform(Number).pipe(z.number().int().min(1).max(100)),
	difficulty: ExerciseDifficultyEnum.optional(),
	muscleGroup: z.string().max(50).trim().optional(),
	type: ExerciseTypeEnum.optional(),
	tags: z
		.string()
		.transform((val)=> val.split(',').filter(Boolean))
		.pipe(z.array(z.uuidv4('Invalid tag ID format')))
		.optional(),
	search: z.string().max(100).trim().optional(),
})

// ============================================
// TAG SCHEMA
// ============================================

export const CreateTagSchema = z.object({
	name: z
		.string({error: 'Tag name is required'})
		.min(2, {error: 'Tag name must be at least 2 characters'})
		.max(30, {error: 'Tag name must be at most 30 characters'})
		.trim()	
		.toLowerCase(),
})

export const TagIdSchema = z.object({
	id: z.uuidv4({ error: 'Invalid tag ID format' })
})

// ============================================
// INFERRED TYPES
// ============================================

export type CreateExerciseInput = z.infer<typeof CreateExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof UpdateExerciseSchema>;
export type ExerciseIdParam = z.infer<typeof ExerciseIdSchema>;
export type ExerciseFiltersInput = z.infer<typeof ExerciseFiltersSchema>;
export type CreateTagInput = z.infer<typeof CreateTagSchema>;
export type TagIdParam = z.infer<typeof TagIdSchema>;