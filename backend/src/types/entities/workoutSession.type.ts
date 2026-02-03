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
	template_id?: string;
	title: string;
	notes?: string;
	session_date: Date;
	duration_minutes?: number;
	created_at: Date;
}

export type WorkoutSessionExerciseRow = {
	id: string;
	session_id: string;
	exercise_id: string;
	order_index: number;
	// join with exercise
	exercise_name: string;
	exercise_description?: string;
	difficulty?: string;
	muscle_group?: string;
	type?: string;
}

export type WorkoutSessionSetRow = {
	id: string;
	session_exercise_id: string;
	set_number: number;
	reps?: number;
	duration_seconds?: number;
	weight?: number;
	rest_seconds?: number;
	notes?: string;
	created_at: Date;
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