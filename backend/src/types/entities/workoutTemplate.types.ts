// src/types/entities/workoutTemplate.types.ts

// WORKOUT TEMPLATE TYPES

export type WorkoutTemplate = {
	id: string;
	userId: string;
	name: string;
	description?: string;
	scheduledDayOfWeek?: number;
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date;
}

export type WorkoutTemplateSet = {
	id: string;
	templateExerciseId: string;
	setNumber: number;
	targetReps?: number;
	targetWeight?: number;
	targetDurationSeconds?: number;
	targetRestSeconds?: number;
}

export type WorkoutTemplateExercise = {
	id: string;
	templateId: string;
	exerciseId: string;
	orderIndex: number;
	suggestedSets?: number;
	suggestedReps?: number;
	notes?: string;
	sets: WorkoutTemplateSet[];
	// join with exercise
	exerciseName: string;
	exerciseDescription?: string;
	difficulty?: string;
	muscleGroup?: string;
	type?: string;
}

export type WorkoutTemplateWithExercises = WorkoutTemplate & {
	exercises: WorkoutTemplateExercise[];
	isFavorite?: boolean;
	usageCount?: number;
	lastUsedAt?: Date;
}

// CREATE/UPDATE TYPES

export type WorkoutTemplateSetCreateData = {
	setNumber: number;
	targetReps?: number;
	targetWeight?: number;
	targetDurationSeconds?: number;
	targetRestSeconds?: number;
}

export type WorkoutTemplateExerciseCreateData = {
	exerciseId: string;
	orderIndex: number;
	suggestedSets?: number;
	suggestedReps?: number;
	notes?: string;
	sets?: WorkoutTemplateSetCreateData[];
}

export type WorkoutTemplateCreateData = {
	userId: string;
	name: string;
	description?: string;
	scheduledDayOfWeek?: number;
	exercises: WorkoutTemplateExerciseCreateData[];
}

export type WorkoutTemplateUpdateData = {
	name?: string;
	description?: string;
	scheduledDayOfWeek?: number;
	exercises?: WorkoutTemplateExerciseCreateData[];
}

// DATABASE ROW TYPES

export type WorkoutTemplateRow = {
	id: string;
	user_id: string;
	name: string;
	description?: string;
	scheduled_day_of_week?: number;
	created_at: Date;
	updated_at: Date;
	deleted_at?: Date;
}

export type WorkoutTemplateExerciseRow = {
	id: string;
	template_id: string;
	exercise_id: string;
	order_index: number;
	suggested_sets?: number;
	suggested_reps?: number;
	notes?: string;
	// join with exercise
	exercise_name: string;
	exercise_description?: string;
	difficulty?: string;
	muscle_group?: string;
	type?: string;
}

export type WorkoutTemplateSetRow = {
	id: string;
	template_exercise_id: string;
	set_number: number;
	target_reps: number | null;
	target_weight: number | null;
	target_duration_seconds: number | null;
	target_rest_seconds: number | null;
}

export type TemplateFavoriteRow = {
	user_id: string;
	template_id: string;
	created_at: Date;
}

// QUERY TYPES
export type WorkoutTemplateFilters = {
	userId?: string;
	searchTerm?: string;
	favoritesOnly?: boolean;
	startDate?: Date;
	endDate?: Date;
}

export type TemplateUsageStats = {
	templateId: string;
	usageCount: number;
	lastUsedAt?: Date;
}