// src/types/entities/workoutSession.type.ts

// WORKOUT SESSION TYPES

export type WorkoutSession = {
	id: string;
	userId: string;
	templateId?: string;
	title: string;
	notes?: string;
	sessionDate: Date;
	durationMinutes?: number;
	createdAt: Date;
}

export type WorkoutSessionExercise = {
	id: string;
	sessionId: string;
	exerciseId: string;
	orderIndex: number;
	sets: WorkoutSessionSet[];
	// join with exercise
	exerciseName: string;
	exerciseDescription?: string;
	difficulty?: string;
	muscleGroup?: string;
	type?: string;
}

export type WorkoutSessionSet = {
	id: string;
	sessionExerciseId: string;
	setNumber: number;
	reps?: number;
	durationSeconds?: number;
	weight?: number;
	restSeconds?: number;
	notes?: string;
	createdAt: Date;
}

export type WorkoutSessionWithExercises = WorkoutSession & {
	exercises: WorkoutSessionExercise[];
	templateName?: string;
}

export type WorkoutSessionWithTemplateName = WorkoutSession & {
	templateName?: string;
}

export type WorkoutSessionWithMetrics = WorkoutSession & {
	totalExercises: number;
	totalSets: number;
	totalVolumeKg: number;
}

// CREATE/UPDATE TYPES

export type WorkoutSessionSetCrateData = {
	setNumber: number;
	reps?: number;
	durationSeconds?: number;
	weight?: number;
	restSeconds?: number;
	notes?: string;
}

export type WorkoutSessionExerciseCreateData = {
	exerciseId: string;
	orderIndex: number;
	sets: WorkoutSessionSetCrateData[];
}

export type WorkoutSessionCreateData = {
	userId: string;
	templateId?: string;
	title: string;
	notes?: string;
	sessionDate: Date;
	durationMinutes?: number;
	exercises: WorkoutSessionExerciseCreateData[];
}

export type WorkoutSessionUpdateData = {
	title?: string;
	notes?: string;
	sessionDate?: Date;
	durationMinutes?: number;
	exercises?: WorkoutSessionExerciseCreateData[];
}

// DATABASE ROW TYPES

export type WorkoutSessionRow = {
	id: string;
	user_id: string;
	template_id: string | null;
	title: string;
	notes: string | null;
	session_date: string;
	duration_minutes: number | null;
	created_at: string;
}

export type WorkoutSessionExerciseRow = {
	id: string;
	session_id: string;
	exercise_id: string;
	order_index: number;
	// join with exercise
	exercise_name: string;
	exercise_description: string | null;
	difficulty: string | null;
	muscle_group: string | null;
	type: string | null;
}

export type WorkoutSessionSetRow = {
	id: string;
	session_exercise_id: string;
	set_number: number;
	reps: number | null;
	duration_seconds: number | null;
	weight: number | null;
	rest_seconds: number | null;
	notes: string | null;
	created_at: string;
}

export type WorkoutSessionWithTemplateNameRow = WorkoutSessionRow & {
	template_name: string | null
}

export type WorkoutSessionWithMetricsRow = WorkoutSessionRow & {
	total_exercises: number;
	total_sets: number;
	total_volume_kg: number;
}

// QUERY TYPES

export type WorkoutSessionFilters = {
	userId?: string;
	templateId?: string;
	startDate?: Date;
	endDate?: Date;
	searchTerm?: string;
}

export type WorkoutSessionStats = {
	totalSessions: number;
	totalDuration: number;
	averageDuration: number;
	sessionsThisWeek: number;
	sessionsThisMonth: number;
	mostUsedTemplate?:{
		templateId: string;
		templateName: string;
		usageCount: number;
	}
}