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
	isDemo?: boolean;
	demoExpiresAt?: string | null;
	createdAt: string;
	updatedAt: string;
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
	accessToken: string;
	user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

// =================================
// EXERCISE TYPES
// =================================

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ExerciseType = 'fuerza' | 'resistencia' | 'skill' | 'explosivo' | 'mobilidad' | 'isométrico';

export interface Exercise {
	id: string;
	name: string;
	description?: string;
	difficulty?: ExerciseDifficulty;
	muscleGroup?: string;
	type?: ExerciseType;
	createdAt: string;
}

export interface ExerciseWithTags extends Exercise {
	tags: Tag[];
}

export interface ExerciseStats {
	total: number;
	byDifficulty: Record<string, number>;
	byType: Record<string, number>;
	byMuscleGroup: Record<string, number>;
}

// =================================
// WORKOUT TEMPLATE
// =================================

export interface WorkoutTemplate {
	id: string;
	userId: string;
	name: string;
	description?: string;
	scheduledDayOfWeek?: number;
	exercises: WorkoutTemplateExercise[];
	createdAt: string;
	updatedAt: string;
	isFavorite?: boolean;
	usageCount?: number;
	lastUsedAt?: string;
}

export interface WorkoutTemplateSet {
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
	sets?: WorkoutTemplateSet[];
	// join with exercise
	exerciseName: string;
	exerciseDescription?: string;
	difficulty?: string;
	muscleGroup?: string;
	type?: string;
}

// Para crear template
export interface CreateWorkoutTemplateData {
	name: string;
	description?: string;
	scheduledDayOfWeek?: number;
	exercises: {
		exerciseId: string;
		orderIndex: number;
		suggestedSets?: number;
		suggestedReps?: number;
		notes?: string;
		sets?: {
			setNumber: number;
			targetReps?: number;
			targetWeight?: number;
			targetDurationSeconds?: number;
			targetRestSeconds?: number;
		}[];
	}[]
}


// =================================
// WORKOUT SESSION
// =================================

export interface WorkoutSession {
	id: string;
	userId: string;
	templateId?: string;
	title: string;
	notes?: string;
	sessionDate: string; // Fecha del entrenamiento
	durationMinutes?: number;  // duración en minutos
	createdAt: string;
}

export interface WorkoutSessionWithMetrics extends WorkoutSession {
	totalExercises: number;
	totalSets: number;
	totalVolumeKg: number;
}

export interface WorkoutSessionWithExercises extends WorkoutSession{
	exercises: WorkoutSessionExercise[];
	templateName?: string;
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

export interface WorkoutSessionSet {
	id: string;
	sessionExerciseId: string;
	setNumber: number;
	reps?: number;
	durationSeconds?: number;
	weight?: number;
	restSeconds?: number;
	notes?: string;
	createdAt: string;
}

/**
 * Editable set used during active workout sessions.
 * Initialized from WorkoutSessionSet template values, allows user overrides.
 */
export interface EditableSet {
	setNumber: number;
	reps?: number;
	weight?: number;
	durationSeconds?: number;
	restSeconds?: number;
	notes?: string;
	isCompleted: boolean;
}


// Para crear session desde template
export interface CreateWorkoutSessionData {
	templateId: string;
	title: string;
	notes?: string;
	sessionDate: string;
	durationMinutes?: number;
	exercises: {
		exerciseId: string;
		orderIndex: number;
		sets: Omit<WorkoutSessionSet, 'id' | 'sessionExerciseId' | 'createdAt'>[];
	}[]
}

export interface SessionFilters {
	page?: number;
	limit?: number;
	startDate?: string;
	endDate?: string;
	templateId?: string;
	searchTerm?: string;
}

export interface WorkoutSessionStats  {
	totalSessions: number;
	totalDuration: number;
	averageDuration: number;
	sessionsThisWeek: number;
	sessionsThisMonth: number;
	mostUsedTemplate?: {
		templateId: string;
		templateName: string;
		usageCount: number;
	}
}

//================================
// WORKOUTS DEPRECATED
//================================

export interface WorkoutExerciseSet {
	id: string;
	workoutExerciseId: string;
	setNumber: number;
	reps?: number;
	durationSeconds?: number;
	weight?: number;
	notes?: string;
	createdAt: string;
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
		exerciseId: string;
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
		earliest?: string,
		latest?: string
	}
}

// =================================
// PROGRESS & GOALS
// =================================
export interface ProgressLog {
	id: string;
	userId: string;
	logDate: string;
	bodyWeight?: number;
	bodyFatPercentage?: number;
	notes?: string;
	createdAt: string;
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
	createdAt: string;
}

export interface PersonalRecord {
	id: string;
	userId: string;
	exerciseId: string;
	maxReps?: number;
	maxDurationSeconds?: number;
	maxWeight?: number;
	achievedAt: string;
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
	startDate?: string;
	endDate?: string;
	searchTerm?: string;
}

export interface ExerciseFilters extends PaginationParams {
	difficulty?: ExerciseDifficulty;
	muscleGroup?: string;
	type?: ExerciseType;
	searchTerm?: string;
}
