// src/types/index.ts

// Re-export types common
export type {ApiResponse} from './common/common.types';
export {NodeEnv, LogLevel} from './common/common.types';

// Re-export types error
export type {AppError, ErrorCode} from './common/error.types';
export { ErrorCodes } from './common/error.types';

// Re-export types database
export type {DatabaseConfig, QueryResult, TransactionFn} from './common/database.types';

// Re-export types entities
export type {
	User, 
	UserCreateData, 
	UserRole, 
	UserRow, 
	UserUpdateData
} from './entities/user.types';

// Re-export types workout
export type{
	Workout, 
	WorkoutWithExercises, 
	WorkoutExercise, 
	WorkoutExerciseSet, 
	WorkoutExerciseSetCreateData, 
	WorkoutExerciseCreateData, 
	WorkoutCreateData, 
	WorkoutUpdateData, 
	WorkoutRow, 
	WorkoutExerciseRow, 
	WorkoutExerciseSetRow,
	WorkoutFilters
} from './entities/workout.types';

// Re-export types exercise
export type {
	Exercise,
	ExerciseWithTags,
	Tag,
	ExerciseDifficulty,
	ExerciseType,
	ExerciseCreateData,
	ExerciseUpdateData,
	ExerciseRow,
	TagRow,
	ExerciseTagRow,
	ExerciseFilters,
	ExerciseStats,
} from './entities/exercise.types';

// Re-export types personal record
export type {
	PersonalRecord,
	PersonalRecordWithExercise,
	PersonalRecordCreateData,
	PersonalRecordUpdateData,
	PersonalRecordRow,
	PersonalRecordWithExerciseRow,
	PersonalRecordFilters,
	PersonalRecordStats
} from './entities/personalRecord.type';