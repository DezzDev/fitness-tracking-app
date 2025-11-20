// ============================================
// src/schemas/workout.schema.ts
// ============================================

import { z } from 'zod';

// ============================================
// WORKOUT EXERCISE SET SCHEMA
// ============================================

export const WorkoutExerciseSetSchema = z.object({
	setNumber: z
		.number({ error: 'Set number is required' })
		.int({ error: 'Set number must be an integer' })
		.min(1, { error: 'Set number must be at least 1' })
		.max(100, { error: 'Set number must be at most 100' }),

	reps: z
		.number()
		.int({ error: 'Reps must be an integer' })
		.min(1, { error: 'Reps must be at least 1' })
		.max(1000, { error: 'Reps cannot exceed 1000' })
		.optional(),

	durationSeconds: z
		.number()
		.int({ error: 'Duration must be an integer' })
		.min(1, { error: 'Duration must be at least 1 second' })
		.max(7200, { error: 'Duration cannot exceed 2 hours' })
		.optional(),

	restSeconds: z
		.number()
		.int({ error: 'Rest time must be an integer' })
		.min(0, { error: 'Rest time cannot be negative' })
		.max(3600, { error: 'Rest time cannot exceed 1 hour' })
		.optional(),

	weight: z
		.number()
		.min(0, { error: 'Weight cannot be negative' })
		.max(1000, { error: 'Weight cannot exceed 1000' })
		.optional(),

	notes: z.string().max(500, 'Notes cannot exceed 500 characters').trim().optional(),
})
	.refine(
		(data) => {
			// al menos debe tener reps o durationSeconds
			return data.reps !== undefined || data.durationSeconds !== undefined;
		},
		{
			error: 'Each set must have either reps or durationSeconds'
		}
	)

// ============================================
// WORKOUT EXERCISE SCHEMA
// ============================================

export const WorkoutExerciseSchema = z.object({
	exerciseId: z.number({ error: 'Exercise ID is required' }),

	orderIndex: z
		.number({ error: 'Order index is required' })
		.int({ error: 'Order index must be an integer' })
		.min(0, { error: 'Order index cannot be negative' })
		.max(100, { error: 'Order index cannot exceed 100' })
		.default(0),

	sets: z
		.array(WorkoutExerciseSetSchema)
		.min(1, { error: 'Exercise must have at least 1 set' })
		.max(50, 'Exercise cannot have more than 50 sets')
		.refine(
			(sets) => {
				// validar que los setNumber sean secuenciales
				const sortedNumbers = sets.map((s) => s.setNumber).sort((a, b) => a - b);
				return sortedNumbers.every((num, idx) => num === idx + 1)
			},
			{ error: 'Set numbers must be sequential starting from 1' }
		)
})

// ============================================
// CREATE WORKOUT SCHEMA
// ============================================

export const CreateWorkoutSchema = z.object({
	title: z
		.string({ error: 'Title is required' })
		.min(3, { error: 'Title must be at least 3 characters' })
		.max(100, { error: 'Title most be at most 100 characters' })
		.trim(),

	notes: z.string().max(1000, { error: "Notes must be at most 1000 characters" }).trim().optional(),

	exercises: z
		.array(WorkoutExerciseSchema)
		.min(1, { error: 'Workout must have at least 1 exercise' })
		.max(50, { error: 'Workout cannot have more than 50 exercises' })
		.refine(
			(exercises) => {
				// validar que los orderIndex sean únicos
				const indexes = exercises.map((e) => e.orderIndex)
				return new Set(indexes).size === indexes.length
			},
			{ error: 'Order indexes must be unique' }
		)
})

// ============================================
// UPDATE WORKOUT SCHEMA
// ============================================

export const UpdateWorkoutSchema = z.object({
	title: CreateWorkoutSchema.shape.title.optional(),
	notes: CreateWorkoutSchema.shape.notes.optional(),
	exercises: CreateWorkoutSchema.shape.exercises.optional(),
}).strict(); // No permite campos adicionales

// ============================================
// WORKOUT ID PARAM SCHEMA
// ============================================

export const WorkoutIdSchema = z.object({
	id: z.string({ error: 'Invalid workout ID format' })
})

// ============================================
// WORKOUT FILTERS SCHEMA (QUERY PARAMS)
// ============================================

export const WorkoutFiltersSchema = z.object({
	page: z.string().default('1').transform(Number).pipe(z.number().int().min(1)),

	limit: z.string().default('10').transform(Number).pipe(z.number().int().min(1).max(100)),

	startDate: z
		.iso.datetime()
		.transform((val)=>new Date(val))
		.optional(),
	
	endDate: z
		.iso.datetime()
		.transform((val)=>new Date(val))
		.optional(),
	
	search: z.string().max(100).trim().optional(),

})

// ============================================
// INFERRED TYPES
// ============================================

export type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;
export type UpdateWorkoutInput = z.infer<typeof UpdateWorkoutSchema>;
export type WorkoutIdParam = z.infer<typeof WorkoutIdSchema>;
export type WorkoutFiltersInput = z.infer<typeof WorkoutFiltersSchema>;
export type WorkoutExerciseSetInput = z.infer<typeof WorkoutExerciseSetSchema>;
export type WorkoutExerciseInput = z.infer<typeof WorkoutExerciseSchema>;