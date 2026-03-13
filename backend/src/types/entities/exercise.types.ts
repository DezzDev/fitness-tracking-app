// src/types/entities/exercise.type.ts

// ============================================
// EXERCISE TYPES
// ============================================

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ExerciseType = 'strength' | 'endurance' | 'skill' | 'explosive';

export type Exercise = {
	id: string;
	name: string;
	description?:string;
	difficulty?: ExerciseDifficulty;
	muscleGroup?: string;
	type?: ExerciseType;
	createdAt:Date;
}

export type ExerciseWithTags = Exercise & {
	tags: Tag[];
};

// ============================================
// TAG TYPES
// ============================================

export type Tag = {
	id: string;
	name : string;
}

// ============================================
// CREATE/UPDATE TYPES
// ============================================

export type ExerciseCreateData = {
	name: string;
	description?: string;
	difficulty?: ExerciseDifficulty;
	muscleGroup?: string;
	type?: ExerciseType;
	tagIds?: string[];
}

export type ExerciseUpdateData = {
	name?: string;
	description?: string;
	difficulty?: ExerciseDifficulty;
	muscleGroup?: string;
	type?: ExerciseType;
	tagIds?: string[];
}

// ============================================
// DATABASE ROW TYPES
// ============================================

export type ExerciseRow = {
	id: string;
	name: string;
	description: string | null;
	difficulty: string | null;
	muscle_group: string | null;
	type: string | null;
	created_at: string;
}

export type TagRow = {
	id: string;
	name: string;
}

export type ExerciseTagRow = {
	exercise_id: string;
	tag_id: string;
}

// ============================================
// QUERY TYPES
// ============================================

export type ExerciseFilters = {
	difficulty?: ExerciseDifficulty;
	muscleGroup?: string;
	type?: ExerciseType;
	tagIDs?: string[];
	searchTerm?: string;
};

export type ExerciseStats = {
	totalExercises: number;
	byDifficulty: Record<ExerciseDifficulty, number>;
	byType: Record<ExerciseType, number>;
	byMuscleGroup: Record<string, number>;
}