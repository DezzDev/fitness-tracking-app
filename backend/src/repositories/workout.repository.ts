import { execute, executeWithRetry, batch } from '@/config/database';
import {
	Workout,
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
} from '@/types/index';
import { v4 as uuidv4 } from "uuid";

// ============================================
// MAPPERS
// ============================================

const mapRowToWorkout = (row: WorkoutRow): Workout => ({
	id: row.id,
	userId: row.user_id,
	title: row.title,
	notes: row.notes || undefined,
	createAt: new Date(row.create_at),
})

const mapRowToWorkoutExercise = (row: WorkoutExerciseRow): Omit<WorkoutExercise, 'sets'> => ({
	id: row.id,
	workoutId: row.workout_id,
	exerciseId: row.exercise_id,
	orderIndex: row.order_index,
	// sets: [], // se rellenará posteriormente
	exerciseName: row.exercise_name,
	exerciseDescription: row.exercise_description,
	difficulty: row.difficulty,
	muscleGroup: row.muscle_group,
	type: row.type,
});

const mapRowToWorkoutExerciseSet = (row: WorkoutExerciseSetRow): WorkoutExerciseSet => ({
	id: row.id,
	workoutExerciseId: row.workout_exercise_id,
	setNumber: row.set_number,
	reps: row.reps || undefined,
	durationSeconds: row.duration_seconds || undefined,
	restSeconds: row.rest_seconds || undefined,
	weight: row.weight || undefined,
	notes: row.notes || undefined,
	createdAt: new Date(row.created_at),
})

// ============================================
// QUERIES
// ============================================

const queries = {
	// crear workout
	createWorkout: {
		sql: `
			INSERT INTO workouts (id, user_id, title, notes, create_at)
			VALUES (?, ?, ?, ?, datetime('now'))
			RETURNING *
		`,
		args: (id: string, userId: string, title: string, notes: string | null) => [
			id, userId, title, notes
		]
	},

	// crear workout exercise
	createWorkoutExercise: {
		sql: `
			INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index)
			VALUES (?, ?, ?, ?)
			RETURNING *
		`,
		args: (id: string, workoutId: string, exerciseId: string, orderIndex: number) => [
			id, workoutId, exerciseId, orderIndex
		]
	},

	// create workout exercise set
	createWorkoutExerciseSet: {
		sql: `
			INSERT INTO workout_exercise_sets
				(id, workout_exercise_id, set_number, reps, duration_seconds, rest_seconds, weight, notes, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
			RETURNING *
		`,
		args: (
			id: string,
			workoutExerciseId: string,
			setNumber: number,
			reps: number | null,
			durationSeconds: number | null,
			restSeconds: number | null,
			weight: number | null,
			notes: string | null
		) => [
				id, workoutExerciseId, setNumber, reps, durationSeconds, restSeconds, weight, notes
			]
	},

	// buscar workout por ID
	findById: {
		sql: `SELECT * FROM workouts WHERE id = ? AND user_id =?`,
		args: (id: string, userId: string) => [ id, userId ]
	},

	// buscar workout exercises con info del ejercicio
	// todos los ejercicios de un entrenamiento
	findWorkoutExercises: {
		sql: `
			SELECT 
				we.*,
				e.name as exercise_name,
				e.description as exercise_description,
				e.difficulty,
				e.muscle_group,
				e.type
			FROM workout_exercises we
			INNER JOIN exercises e ON we.exercise_id = e.id
			WHERE we.workout_id = ?
			ORDER BY we.order_index ASC
		`,
		args: (workoutId: string) => [ workoutId ]
	},

	// buscar sets de un workout exercise
	findWorkoutExerciseSets: {
		sql: `
			SELECT * FROM workout_exercise_sets
			WHERE workout_exercise_id = ?
			ORDER BY set_number ASC
		`,
		args: (workoutExerciseId: string) => [ workoutExerciseId ]
	},

	// listar workouts con filtros 
	findAll: {
		sql: (filters: WorkoutFilters) => {
			let sql = `SELECT * FROM workouts WHERE user_id = ?`;

			if (filters.startDate) {
				sql += `AND datetime(created_at) >= datetime(?)`;
			}

			if (filters.endDate) {
				sql += `AND datetime(created_at) <= datetime(?)`;
			}

			if (filters.searchTerm) {
				sql += `AND (title LIKE ? OR notes LIKE ?)`;
			}

			sql += `ORDER BY create_at DESC LIMIT ? OFFSET ?`;
			return sql;
		},
		args: (filters: WorkoutFilters, limit: number, offset: number) => {
			const args: any[] = [ filters.userId ];

			if (filters.startDate) {
				args.push(filters.startDate.toISOString());
			}

			if (filters.endDate) {
				args.push(filters.endDate.toISOString());
			}

			if (filters.searchTerm) {
				const searchPattern = `%${filters.searchTerm}%`;
				args.push(searchPattern, searchPattern);
			}

			args.push(limit, offset);

			return args;
		}
	},

	// contar workouts 
	count: {
		sql: (filters: WorkoutFilters) => {
			let sql = `SELECT COUNT(*) as total FROM workouts WHERE user_id = ?`;

			if (filters.startDate) {
				sql += `AND datetime(created_at) >= datetime(?)`;
			}

			if (filters.endDate) {
				sql += `AND datetime(created_at) <= datetime(?)`;
			}

			if (filters.searchTerm) {
				sql += `AND (title LIKE ? OR notes LIKE ?)`;
			}

			return sql;
		},
		args: (filters: WorkoutFilters) => {
			const args: any[] = [ filters.userId ];

			if (filters.startDate) {
				args.push(filters.startDate.toISOString());
			}

			if (filters.endDate) {
				args.push(filters.endDate.toISOString());
			}

			if (filters.searchTerm) {
				const searchPattern = `%${filters.searchTerm}%`;
				args.push(searchPattern, searchPattern);
			}

			return args;
		}
	},

	// actualizar workout
	updateWorkout: {
		sql: (fields: string[]) => `
			UPDATE workouts
			SET ${fields.map((f) => `${f} = ?`).join(', ')}
			WHERE id = ? ADN user_id = ?
			RETURNING *
		`,
		args: (id: string, userId: string, data: Partial<WorkoutUpdateData>) =>{
			const values = Object.values(data);
			return [...values, id, userId]
		}
	},

	// eliminar workout exercises de un workout
	// elimina todos los ejercicios de un entrenamiento
	deleteWorkoutExercises: {
		sql: `DELETE FROM workout_exercises WHERE workout_id = ?`,
		args: (workoutId: string) => [workoutId]
	},

	// eliminar workout (cascade eliminará exercises y sets asociados)
	deleteWorkout: {
		sql: `DELETE FROM workouts WHERE id = ? AND user_id = ?`,
		args: (id: string, userId: string) => [id, userId]
	}
};