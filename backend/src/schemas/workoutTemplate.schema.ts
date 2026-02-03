import z from 'zod';

export const WorkoutTemplateExerciseSchema = z.object({
	exerciseId: z.uuid('Invalid exercise ID format'),

	orderIndex: z
		.number()
		.int('Order index must be an integer')
		.nonnegative('Order index must be a positive number')
		.max(100),

	suggestedSets: z
		.int('Suggested sets must be an integer')
		.min(1)
		.max(20)
		.optional(),

	suggestedReps: z
		.int('Suggested reps must be an integer')
		.min(1)
		.max(500)
		.optional(),

	notes: z.string().max(500, 'Notes cannot exceed 500 characters').trim().optional(),
})

export const CreateWorkoutTemplateSchema = z.object({
	name: z
		.string({ error: 'Name is required' })
		.min(3, { error: 'Name must be at least 3 characters' })
		.max(100, { error: 'Name must be at most 100 characters' })
		.trim(),
	
	description: z
		.string()
		.max(1000, { error: 'Description must be at most 1000 characters' })
		.trim()
		.optional(),
	
	exercises: z
		.array(WorkoutTemplateExerciseSchema)
		.min(1, { error: 'Workout template must have at least 1 exercise' })
		.max(50, { error: 'Workout template cannot have more than 50 exercises' })
		.refine((exercises)=>{
			const indexes = exercises.map(e => e.orderIndex)
			return new Set(indexes).size === indexes.length
		},
		{ error: 'Order indexes must be unique' }
	)
})

export const UpdateWorkoutTemplateSchema = z.object({
	name: CreateWorkoutTemplateSchema.shape.name.optional(),
	description: CreateWorkoutTemplateSchema.shape.description.optional(),
	exercises: CreateWorkoutTemplateSchema.shape.exercises.optional()
}).strict()

export const WorkoutTemplateIdSchema = z.object({
	id: z.uuid({ error: 'Invalid workout template ID format' })
})

export const WorkoutTemplateFiltersSchema = z.object({
	page: z.string().default('1').transform(Number).pipe(z.number().int().min(1)),
	limit: z.string().default('10').transform(Number).pipe(z.number().int().min(1).max(100)),
	searchTerm: z.string().max(100).trim().optional(),
	favoritesOnly: z.boolean().optional(),
})

// ============================================
// INFERRED TYPES
// ============================================
 export type CreateWorkoutTemplateInput = z.infer<typeof CreateWorkoutTemplateSchema>;
 export type UpdateWorkoutTemplateInput = z.infer<typeof UpdateWorkoutTemplateSchema>;
 export type WorkoutTemplateIdParam = z.infer<typeof WorkoutTemplateIdSchema>;
 export type WorkoutTemplateFiltersInput = z.infer<typeof WorkoutTemplateFiltersSchema>;
 export type WorkoutTemplateExerciseInput = z.infer<typeof WorkoutTemplateExerciseSchema>;