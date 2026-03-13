// src/types/entities/personalRecord.type.ts

// =======================
// Personal Record Types
// =======================

export type PersonalRecord = {
	id: string;
	userId: string;
	exerciseId: string;
	maxReps?: number;
	maxDurationSeconds?: number;
	maxWeight?: number;
	achievedAt: Date;
}

export type PersonalRecordWithExercise = PersonalRecord & {
	exerciseName: string;
	exerciseDescription?: string;
	difficulty?: string;
	muscleGroup?: string;
	type?: string;
}

// =======================
// Create/Update Types
// =======================

export type PersonalRecordCreateData = {
	userId: string;
	exerciseId: string;
	maxReps?: number;
	maxDurationSeconds?: number;
	maxWeight?: number;
}

export type PersonalRecordUpdateData = {
	maxReps?: number;
	maxDurationSeconds?: number;
	maxWeight?: number;
}

// =======================
// Database Row Types
// =======================

export type PersonalRecordRow = {
	id: string;
	user_id : string;
	exercise_id: string;
	max_reps: number | null;
	max_duration_seconds: number | null;
	max_weight: number | null;
	achieved_at: Date;
}

export type PersonalRecordWithExerciseRow = PersonalRecordRow & {
	exercise_name: string;
	exercise_description: string | null;
	difficulty: string | null;
	muscle_group: string | null;
	type: string | null;
}

// =======================
// Query Types
// =======================

export type PersonalRecordFilters = {
	userId?: string;
	exerciseId?: string;
	muscleGroup?: string;
	difficulty?: string;
	type?: string;
}

export type PersonalRecordStats = {
	totalRecords: number;
	byMuscleGroup: Record<string, number>;
	byDifficulty: Record<string,number>;
	recentRecords: PersonalRecordWithExercise[];
}