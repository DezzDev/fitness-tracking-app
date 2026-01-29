// src/types/index.ts

// =================================
// USER TYPES
// =================================

export interface User {
	id: string;
	email: string;
	name: string;
	age: number;
	role: 'user' | 'admin';
	profileImage?: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}


export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterData {
	email: string;
	password: string;
	name: string;
	age: number;
	profileImage?: string;
	role?: 'user' | 'admin';
	acceptTerms: boolean;
}

export interface AuthResponse {
	token: string;
	user: User;
}

// =================================
// EXERCISE TYPES
// =================================

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ExerciseType = 'strength' | 'endurance' | 'skill' | 'explosive';

export interface Exercise {
	id: string;
	name: string;
	description?: string;
	difficulty?: ExerciseDifficulty;
	muscleGroup?: string;
	type?: ExerciseType;
	createdAt: Date;
}

export interface ExerciseWithTags extends Exercise {
	tags: Tag[];
}

// =================================
// WORKOUT TYPES
// =================================

export interface WorkoutTemplate {
	id: string;
	userId: number;
	name: string;
	description?: string;
	exercises: WorkoutTemplateExercise[];
	createdAt: Date;
	updatedAt: Date;
}

export interface WorkoutTemplateExercise {
	id: string;
	templateId: string;
	exerciseId: string;
	orderIndex: number;
	exercise: Exercise;
	suggestedSets?: number; // Número sugerido de sets
	suggestedReps?: number; // Número sugerido de reps
	notes?: string;	// Notas del ejercicio en la plantilla
}

export interface WorkoutSession {
	id: string;
	userId: string;
	templateId: string;
	title: string;
	notes?: string;
	sessionDate: Date; // Fecha del entrenamiento
	duration?: number;  // duración en minutos
	exercises: WorkoutSessionExercise[];
	createdAt: Date;
}


export interface WorkoutSessionExercise {
	id: string;
	sessionId: string;
	exerciseId: string;
	orderIndex: number;
	exercise: Exercise;
	sets: WorkoutExerciseSet[];
}

export interface WorkoutExerciseSet {
	id: string;
	workoutExerciseId: string;
	setNumber: number;
	reps?: number;
	durationSeconds?: number;
	weight?: number;
	notes?: string;
	createdAt: Date;
}

// Para crear template
export interface CreateWorkoutTemplateData{
	name: string;
	description?: string;
	exercises: {
		exerciseId: string;
		orderIndex: number;
		suggestedSets?: number;
		suggestedReps?: number;
		notes?: string;
	}[]
}

// Para crear session desde template
export interface CreateWorkoutSessionData {
	templateId: string;
	title: string;
	notes?: string;
	sessionDate: Date;
	exercises: {
		exerciseId: number;
		orderIndex: number;
		sets: Omit<WorkoutExerciseSet, 'id' | 'workoutExerciseId' | 'createdAt'>[];
	}
}

// DEPRECATED: Mantener para compatibilidad temporal
export interface WorkoutExercise {
	id: string;
	workoutId: string;
	exerciseId: string;
	orderIndex: number;
	exercise: Exercise;
	sets: WorkoutExerciseSet[];
}


export interface Workout {
	id: string;
	userId: string;
	title: string;
	notes?: string;
	createdAt: string;
}

export interface WorkoutWithExercises extends Workout {
	exercises: WorkoutExercise[];
}

export interface CreateWorkoutData {
	title: string;
	notes?: string;
	exercises: {
		exerciseId: number;
		orderIndex: number;
		sets: Omit<WorkoutExerciseSet, 'id' | 'workoutExerciseId' | 'createdAt'>[];
	}[];
}

export type UpdateWorkoutData = Partial<CreateWorkoutData>;

export interface WorkoutStats {
	totalWorkouts: number,
	totalExercises: number,
	averageExercisesPerWorkout: number,
	dateRange: {
		earliest?: Date,
		latest?: Date
	}
}

// =================================
// PROGRESS & GOALS
// =================================
export interface ProgressLog {
	id: string;
	userId: string;
	logDate: Date;
	bodyWeight?: number;
	bodyFatPercentage?: number;
	notes?: string;
	createdAt: Date;
}

export interface UserGoal {
	id: string;
	userId: string;
	exerciseId: string;
	targetReps?: number;
	targetDurationSeconds?: number;
	targetWeight?: number;
	notes?: string;
	achieved: boolean;
	createdAt: Date;
}

export interface PersonalRecord {
	id: string;
	userId: string;
	exerciseId: string;
	maxReps?: number;
	maxDurationSeconds?: number;
	maxWeight?: number;
	achievedAt: Date;
}

// =================================
// TAG TYPES
// =================================

export interface Tag {
	id: string;
	name: string;
}

// =================================
// FILTER & PAGINATION
// =================================

export interface PaginationParams {
	page?: number;
	limit?: number;
}

export interface WorkoutFilters extends PaginationParams {
	startDate?: Date;
	endDate?: Date;
	searchTerm?: string;
}

export interface ExerciseFilters extends PaginationParams {
	difficulty?: ExerciseDifficulty;
	muscleGroup?: string;
	type?: ExerciseType;
	searchTerm?: string;
}
