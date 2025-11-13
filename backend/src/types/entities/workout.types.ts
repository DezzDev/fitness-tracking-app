// ============================================
// src/types/workout.types.ts
// ============================================

// ============================================
// WORKOUT TYPES
// ============================================

export type Workout = {
	id: string;
	userId: string;
	title: string;
	notes?: string;
	createAt: Date;
};

export type WorkoutWithExercises= Workout & {
	exercises: WorkoutExercise[];
}

// ============================================
// WORKOUT EXERCISE TYPES
// ============================================

export type WorkoutExercise = {
	id: string;
	workoutId: string;
	exerciseId: string;
	orderIndex: number;
	// datos del set ejercicio (joined)
	sets: WorkoutExerciseSet[];
	// datos del ejercicio (joined)
	exerciseName?:string;
	exerciseDescription?:string;
	difficulty?: string;
	muscleGroup?: string;
	type?: string;
}

// ============================================
// WORKOUT EXERCISE SET TYPES
// ============================================

export type WorkoutExerciseSet = {
	id: string;
	workoutExerciseId: string;
	setNumber:number;
	reps?: number;
	durationSeconds?: number;
	restSeconds?: number;
	weight?: number;
	notes?: string;
	createdAt?: Date;
}

// ============================================
// CREATE/UPDATE TYPES
// ============================================

export type WorkoutExerciseSetCreateData = {
	setNumber: number;
	reps?: number;
	durationSeconds?: number;
	restSeconds?: number;
	weight?: number;
	notes?: string;
}

export type WorkoutExerciseCreateData = {
	exerciseId: string;
	orderIndex: number;
	sets: WorkoutExerciseSetCreateData[];
}

export type WorkoutCreateData = {
	userId: string;
	title: string;
	notes?: string;
	exercises: WorkoutExerciseCreateData[];
}

export type WorkoutUpdateData = {
	title?: string;
	notes?: string;
	exercises?: WorkoutExerciseCreateData[];
}

// ============================================
// DATABASE ROW TYPES
// ============================================

export type WorkoutRow = {
	id:string;
	user_id: string;
	title: string;
	notes: string | null;
	create_at: Date; // quizá debería ser string?
}

export type WorkoutExerciseRow ={
	id: string;
	workout_id : string;
	exercise_id: string;
	order_index: number;
	// Joined from exercises table
	exercise_name?: string;
	exercise_description?: string;
	difficulty?: string;
	muscle_group?: string;
	type?: string;
}

export type WorkoutExerciseSetRow = {
	id: string;
	workout_exercise_id: string;
	set_number: number;
	reps: number | null;
	duration_seconds: number | null;
	rest_seconds: number | null;
	weight: number | null;
	notes: string | null;
	created_at: Date; // quizá debería ser string?
}

// ============================================
// QUERY TYPES
// ============================================

export type WorkoutFilters = {
	userId?: string;
	startDate?: Date;
	endDate?: Date;
	searchTerm?: string;
};

export type WorkoutStats = {
	totalWorkouts: number;
	totalExercises: number;
	mostUsedExercises: {
		exerciseId: string;
		exerciseName: string;
		count: number;
	}[]
}
