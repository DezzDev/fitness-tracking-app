// src/schemas/personalRecord.schema.ts

import { z } from 'zod';


export const personalRecordValuesSchema = z.object({

	maxReps: z
		.number()
		.int('Max reps must be an integer')
		.nonnegative('Max reps must be a positive number')
		.max(10000, 'Max reps cannot exceed 10000')
		.optional(),

	maxDurationSeconds: z
		.number()
		.int('Max duration seconds must be an integer')
		.nonnegative('Max duration seconds must be a positive number')
		.max(86400, 'Max duration seconds cannot exceed 24 hours')
		.optional(),

	maxWeight: z
		.number()
		.nonnegative('Max weight must be a positive number')
		.max(10000, 'Max weight cannot exceed 10000')
		.optional(),
})

const atLeastOneRecordRefine = (data: z.infer<typeof personalRecordValuesSchema>) =>
	data.maxReps !== undefined ||
	data.maxDurationSeconds !== undefined ||
	data.maxWeight !== undefined;

// ============================================
// Create Personal Record Schema
// ============================================

export const CreatePersonalRecordSchema = personalRecordValuesSchema
	.extend({
		exerciseId: z.uuid('Invalid exercise ID format')
	})
	.refine(atLeastOneRecordRefine, 'At least one record value must be provided')

// ============================================
// Update Personal Record Schema
// ============================================

export const UpdatePersonalRecordSchema = personalRecordValuesSchema
	.refine(atLeastOneRecordRefine, 'At least one record value must be provided')
	.strict(); // No permite campos adicionales

// ============================================
// Personal Record ID Param Schema
// ============================================

export const PersonalRecordIdSchema = z.object({
	id: z.uuid('Invalid personal record ID format')
})

// ============================================
// Personal Record Filters Schema
// ============================================

export const PersonalRecordFiltersSchema = z.object({
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

	exerciseId: z.uuid('Invalid exercise ID format').optional(),

	muscleGroup: z.string().max(50).trim().optional(),

	difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),

	type: z.enum(['strength', 'endurance', 'skill', 'explosive']).optional(),
})

// ============================================
// Inferred Types
// ============================================

export type CreatePersonalRecordInput = z.infer<typeof CreatePersonalRecordSchema>;
export type UpdatePersonalRecordInput = z.infer<typeof UpdatePersonalRecordSchema>;
export type PersonalRecordIdParam = z.infer<typeof PersonalRecordIdSchema>;
export type PersonalRecordFiltersInput = z.infer<typeof PersonalRecordFiltersSchema>;