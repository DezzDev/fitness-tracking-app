// src/features/workouts/schemas/workoutSchemas.ts
import { z } from 'zod';

/**
 *  Schema para un set individual
 */

export const WorkoutExerciseSetSchema = z.object({
	setNumber: z
		.number({ error: 'Set number is required' })
		.int({ error: 'Set number must be an integer' })
		.min(1, { error: 'Set number must be at least 1' })
		.max(100, { error: 'Set number must be at most 100' }),

	reps: z
		.number()
		.int({ error: 'Reps must be an integer' })
		.min(0, 'Reps cannot be negative')
		.max(1000, { error: 'Reps cannot exceed 1000' })
		.optional(),

	durationSeconds: z
		.number()
		.int({ error: 'Duration must be an integer' })
		.min(0, { error: 'Duration cannot be negative' })
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

	notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').trim().optional(),
})

/**
 * Schema para un ejercicio en el workout
 */
export const WorkoutExerciseSchema = z.object({
	exerciseId: z.uuid({ error: 'Exercise ID is required' }),

	orderIndex: z
		.number({ error: 'Order index must be a number' })
		.int({ error: 'Order index must be an integer' })
		.min(0, { error: 'Order index cannot be negative' })
		.max(100, { error: 'Order index cannot exceed 100' }),

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

/**
 * Schema para crear un nuevo workout
 */
export const CreateWorkoutSchema = z.object({
	title: z
		.string({ error: 'Must be a string' })
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

export type WorkoutExerciseSetFormData = z.infer<typeof WorkoutExerciseSetSchema>
export type WorkoutExerciseFormData = z.infer<typeof WorkoutExerciseSchema>
export type CreateWorkoutFormData = z.infer<typeof CreateWorkoutSchema>