// src/schemas/workoutSession.schema

import {z} from 'zod'

// ==========================================
// Base schemas
// ==========================================

/**
 * Schema for session exercise set
 */
export const WorkoutSessionSetSchema = z.object({
	setNumber: z
		.number()
		.int('Set number must be an integer')
		.positive('Set number must be positive')
		.max(50, 'Set number cannot exceed 50'),

	reps: z
		.number()
		.int('Reps must be an integer')
		.positive('Reps must be positive')
		.max(1000, 'Reps cannot exceed 1000')
		.optional(),

	durationSeconds: z
		.number()
		.int('Duration must be an integer')
		.positive('Duration must be positive')
		.max(7200, 'Duration cannot exceed 2 hours')
		.optional(),

	weight: z
		.number()
		.positive('Weight must be positive')
		.max(1000, 'Weight cannot exceed 1000kg')
		.optional(),

	restSeconds: z
		.number()
		.int('Rest seconds must be an integer')
		.nonnegative('Rest seconds must be non-negative')
		.max(1800, 'Rest cannot exceed 30 minutes')
		.optional(),

	notes: z
		.string()
		.max(500, 'Notes cannot exceed 500 characters')
		.trim()
		.optional(),
});

/**
 * Schema for workout session exercise
 */
export const WorkoutSessionExerciseSchema = z.object({
	exerciseId: z.string().uuid('Invalid exercise ID format'),

	orderIndex: z
		.number()
		.int('Order index must be an integer')
		.nonnegative('Order index must be non-negative')
		.max(100, 'Order index cannot exceed 100'),

	sets: z
		.array(WorkoutSessionSetSchema)
		.min(1, 'Exercise must have at least 1 set')
		.max(50, 'Exercise cannot have more than 50 sets')
		.refine(
			(sets) => {
				const setNumbers = sets.map(s => s.setNumber);
				return new Set(setNumbers).size === setNumbers.length;
			},
			{ message: 'Set numbers must be unique' }
		),
});

// ==========================================
// Create schemas
// ==========================================

/**
 * Schema for creating a workout session
 */
export const CreateWorkoutSessionSchema = z.object({
	templateId: z
		.string()
		.uuid('Invalid template ID format')
		.optional(),

	title: z
		.string()
		.min(3, 'Title must be at least 3 characters')
		.max(100, 'Title cannot exceed 100 characters')
		.trim(),

	notes: z
		.string()
		.max(2000, 'Notes cannot exceed 2000 characters')
		.trim()
		.optional(),

	sessionDate: z
		.string()
		.datetime('Invalid date format')
		.or(z.date())
		.transform(val => typeof val === 'string' ? new Date(val) : val)
		.refine(
			(date) => date <= new Date(),
			{ message: 'Session date cannot be in the future' }
		),

	durationMinutes: z
		.number()
		.int('Duration must be an integer')
		.positive('Duration must be positive')
		.max(720, 'Duration cannot exceed 12 hours')
		.optional(),

	exercises: z
		.array(WorkoutSessionExerciseSchema)
		.min(1, 'Session must contain at least 1 exercise')
		.max(50, 'Session cannot contain more than 50 exercises')
		.refine(
			(exercises) => {
				const exerciseIds = exercises.map(e => e.exerciseId);
				return new Set(exerciseIds).size === exerciseIds.length;
			},
			{ message: 'Session cannot contain duplicate exercises' }
		)
		.refine(
			(exercises) => {
				const orderIndexes = exercises.map(e => e.orderIndex);
				return new Set(orderIndexes).size === orderIndexes.length;
			},
			{ message: 'Exercise order indexes must be unique' }
		),
});

// ==========================================
// Update schemas
// ==========================================

/**
 * Schema for updating a workout session
 */
export const UpdateWorkoutSessionSchema = z.object({
	title: z
		.string()
		.min(3, 'Title must be at least 3 characters')
		.max(100, 'Title cannot exceed 100 characters')
		.trim()
		.optional(),

	notes: z
		.string()
		.max(2000, 'Notes cannot exceed 2000 characters')
		.trim()
		.optional(),

	sessionDate: z
		.iso.datetime('Invalid date format')
		.or(z.date())
		.transform(val => typeof val === 'string' ? new Date(val) : val)
		.refine(
			(date) => date <= new Date(),
			{ message: 'Session date cannot be in the future' }
		)
		.optional(),

	durationMinutes: z
		.number()
		.int('Duration must be an integer')
		.positive('Duration must be positive')
		.max(720, 'Duration cannot exceed 12 hours')
		.optional(),

	exercises: z
		.array(WorkoutSessionExerciseSchema)
		.min(1, 'Session must contain at least 1 exercise')
		.max(50, 'Session cannot contain more than 50 exercises')
		.refine(
			(exercises) => {
				const exerciseIds = exercises.map(e => e.exerciseId);
				return new Set(exerciseIds).size === exerciseIds.length;
			},
			{ message: 'Session cannot contain duplicate exercises' }
		)
		.refine(
			(exercises) => {
				const orderIndexes = exercises.map(e => e.orderIndex);
				return new Set(orderIndexes).size === orderIndexes.length;
			},
			{ message: 'Exercise order indexes must be unique' }
		)
		.optional(),
}).refine(
	(data) => Object.keys(data).length > 0,
	{ message: 'At least one field must be provided for update' }
);

// ==========================================
// Query / Filter schemas
// ==========================================

/**
 * Schema for querying workout sessions with filters
 */
export const WorkoutSessionFiltersSchema = z.object({
	templateId: z
		.string()
		.uuid('Invalid template ID format')
		.optional(),

	startDate: z
		.iso.datetime('Invalid start date format')
		.transform(val => new Date(val))
		.optional(),

	endDate: z
		.iso.datetime('Invalid end date format')
		.transform(val => new Date(val))
		.optional(),

	searchTerm: z
		.string()
		.min(1, 'Search term must not be empty')
		.max(100, 'Search term cannot exceed 100 characters')
		.trim()
		.optional(),

	page: z
		.string()
		.regex(/^\d+$/, 'Page must be a number')
		.transform(Number)
		.refine(val => val > 0, { message: 'Page must be greater than 0' })
		.optional()
		.default(1),

	limit: z
		.string()
		.regex(/^\d+$/, 'Limit must be a number')
		.transform(Number)
		.refine(val => val > 0 && val <= 100, {
			message: 'Limit must be between 1 and 100'
		})
		.optional()
		.default(10),
}).refine(
	(data) => {
		if (data.startDate && data.endDate) {
			return data.startDate <= data.endDate;
		}
		return true;
	},
	{ message: 'Start date must be before or equal to end date' }
);

// ==========================================
// Param schemas
// ==========================================

/**
 * Schema for workout session ID parameter
 */
export const WorkoutSessionIdSchema = z.object({
	id: z.uuid('Invalid session ID format'),
});

/**
 * Schema to create a workout session from a template
 */
export const CreateFromTemplateSchema = z.object({
	templateId: z.uuid('Invalid template ID format'),

	sessionDate: z
		.iso
		.datetime('Invalid date format')
		.or(z.date())
		.transform(val => typeof val === 'string' ? new Date(val) : val)
		.refine(
			(date) => date <= new Date(),
			{ message: 'Session date cannot be in the future' }
		),

	notes: z
		.string()
		.max(2000, 'Notes cannot exceed 2000 characters')
		.trim()
		.optional(),

	durationMinutes: z
		.number()
		.int('Duration must be an integer')
		.positive('Duration must be positive')
		.max(720, 'Duration cannot exceed 12 hours')
		.optional(),
});

/**
 * Schema to duplicate a workout session
 */
export const DuplicateSessionSchema = z.object({
	newDate: z
		.string()
		.datetime('Invalid date format')
		.or(z.date())
		.transform(val => typeof val === 'string' ? new Date(val) : val)
		.refine(
			(date) => date <= new Date(),
			{ message: 'New date cannot be in the future' }
		),
});

/**
 * Schema to obtain a workout session by dates range
 */
export const DateRangeSchema = z.object({
	startDate: z
		.string()
		.datetime('Invalid start date format')
		.transform(val => new Date(val)),

	endDate: z
		.string()
		.datetime('Invalid end date format')
		.transform(val => new Date(val)),
}).refine(
	(data) => data.startDate <= data.endDate,
	{ message: 'Start date must be before or equal to end date' }
);

// ============================================
// INFERRED TYPES
// ============================================

export type CreateWorkoutSessionInput = z.infer<typeof CreateWorkoutSessionSchema>;
export type UpdateWorkoutSessionInput = z.infer<typeof UpdateWorkoutSessionSchema>;
export type WorkoutSessionFiltersInput = z.infer<typeof WorkoutSessionFiltersSchema>;
export type WorkoutSessionIdParam = z.infer<typeof WorkoutSessionIdSchema>;
export type CreateFromTemplateInput = z.infer<typeof CreateFromTemplateSchema>;
export type DuplicateSessionInput = z.infer<typeof DuplicateSessionSchema>;
export type DateRangeInput = z.infer<typeof DateRangeSchema>;
export type WorkoutSessionExerciseInput = z.infer<typeof WorkoutSessionExerciseSchema>;
export type WorkoutSessionSetInput = z.infer<typeof WorkoutSessionSetSchema>;