import { execute, executeWithRetry, batch } from '@/config/database';
import {
	Workout,
	WorkoutExercise,
	WorkoutExerciseSet,
	WorkoutCreateData,
	WorkoutUpdateData,
	WorkoutRow,
	WorkoutExerciseRow,
	WorkoutExerciseSetRow,
	WorkoutFilters,
	WorkoutWithExercises
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
	createdAt: new Date(row.created_at),
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
			INSERT INTO workouts (id, user_id, title, notes, created_at)
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
		args: (id: string, workoutId: string, exerciseId: number, orderIndex: number) => [
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

			sql += `ORDER BY created_at DESC LIMIT ? OFFSET ?`;
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
		args: (id: string, userId: string, data: Partial<Omit<WorkoutUpdateData, 'exercises'>>) => {
			const values = Object.values(data);
			return [ ...values, id, userId ]
		}
	},

	// eliminar workout exercises de un workout
	// elimina todos los ejercicios de un entrenamiento
	deleteWorkoutExercises: {
		sql: `DELETE FROM workout_exercises WHERE workout_id = ?`,
		args: (workoutId: string) => [ workoutId ]
	},

	// eliminar workout (cascade eliminará exercises y sets asociados)
	deleteWorkout: {
		sql: `DELETE FROM workouts WHERE id = ? AND user_id = ?`,
		args: (id: string, userId: string) => [ id, userId ]
	}
};

// ============================================
// REPOSITORY
// ============================================

export const workoutRepository = {
	/**
	 * Crear workout con ejercicios y sets (transacción simulada con batch)
	 * @data datos del workout a crear (userId, title, notes, ejercicios)
	 * @returns workout completo con ejercicios y sets
	 */

	create: async (data: WorkoutCreateData): Promise<WorkoutWithExercises> => {
		const workoutId = uuidv4();

		// 1. Crear workout
		const workoutResult = await executeWithRetry((client) =>
			client.execute({
				sql: queries.createWorkout.sql,
				args: queries.createWorkout.args(workoutId, data.userId, data.title, data.notes || null)
			}))

		if (workoutResult.rows.length === 0) {
			throw new Error('Failed to create workout');
		}
		console.log('workout created')

		const workout = mapRowToWorkout(workoutResult.rows[ 0 ] as unknown as WorkoutRow);

		// 2. Crear workout exercises (ejercicios del entrenamiento) y sus sets
		const allQueries: Array<{ sql: string; args: any[] }> = []

		for (const exercise of data.exercises) {
			const workoutExerciseId = uuidv4();

			// query para crear workout exercise
			allQueries.push({
				sql: queries.createWorkoutExercise.sql,
				args: queries.createWorkoutExercise.args(
					workoutExerciseId,
					workout.id, // también podría usarse workoutId
					exercise.exerciseId,
					exercise.orderIndex
				)
			});

			// queries para crear sets
			for (const set of exercise.sets) {
				const setId = uuidv4();
				allQueries.push({
					sql: queries.createWorkoutExerciseSet.sql,
					args: queries.createWorkoutExerciseSet.args(
						setId,
						workoutExerciseId,
						set.setNumber,
						set.reps || null,
						set.durationSeconds || null,
						set.restSeconds || null,
						set.weight || null,
						set.notes || null
					)
				})
			}
		}

		// ejecutar todas las queries en batch
		await batch(allQueries);

		// 3. Obtener workout completo con ejercicios y sets
		const completeWorkout = await workoutRepository.findById(workoutId, data.userId);

		if (!completeWorkout) {
			throw new Error('Failed to retrieve created workout');
		}

		return completeWorkout;

	},

	/**
	 * Buscar workout por ID con ejercicios y sets
	 * @id id del workout
	 * @userId id del usuario
	 * @returns workout completo con ejercicios y sets
	 */
	findById: async (id: string, userId: string): Promise<WorkoutWithExercises | null> => {
		// 1. Buscar workout
		const workoutResult = await execute({
			sql: queries.findById.sql,
			args: queries.findById.args(id, userId),
		});

		if (workoutResult.rows.length === 0) return null;

		const workout = mapRowToWorkout(workoutResult.rows[ 0 ] as unknown as WorkoutRow);

		// 2. Buscar workout exercises (todos los ejercicios del entrenamiento)
		const exercisesResult = await execute({
			sql: queries.findWorkoutExercises.sql,
			args: queries.findWorkoutExercises.args(id)
		})

		// 3. Para cada exercise, buscar sus sets
		const exercises: WorkoutExercise[] = await Promise.all(
			exercisesResult.rows.map(async (row) => {
				const exercise = mapRowToWorkoutExercise(row as unknown as WorkoutExerciseRow);

				const setResult = await execute({
					sql: queries.findWorkoutExerciseSets.sql,
					args: queries.findWorkoutExerciseSets.args(exercise.id)
				});

				const sets = setResult.rows.map((setRow) =>
					mapRowToWorkoutExerciseSet(setRow as unknown as WorkoutExerciseSetRow)
				);

				return {
					...exercise,
					sets
				}
			})
		)

		return {
			...workout,
			exercises
		}

	},

	/**
	* Listar workouts con filtros y paginación
	* @filters filtros para buscar workouts (userId, fecha de inicio, fecha de fin, título de búsqueda)
	* @page página actual
	* @limit número de resultados por página
	* @returns lista de workouts con ejercicios y sets
	*/
	findAll: async (
		filters: WorkoutFilters,
		page: number = 1,
		limit: number = 10
	): Promise<WorkoutWithExercises[]> => {
		const offset = (page - 1) * limit;

		const workoutResult = await execute({
			sql: queries.findAll.sql(filters),
			args: queries.findAll.args(filters, limit, offset)
		})

		if (workoutResult.rows.length === 0) return []

		// obtener cada workout completo con ejercicios y sets
		const workouts = await Promise.all(
			workoutResult.rows.map(async (row) => {
				const workout = mapRowToWorkout(row as unknown as WorkoutRow);
				const completeWorkout = await workoutRepository.findById(workout.id, workout.userId)
				return completeWorkout;
			})
		);

		return workouts.filter((w) => w !== null)

	},

	/**
	 * Contar workouts con filtros
	 * @filters filtros para buscar workouts (userId, fecha de inicio, fecha de fin, título de búsqueda)
	 * @returns número de workouts
	 */
	count: async (filters:WorkoutFilters): Promise<number> =>{
		const result = await execute({
			sql: queries.count.sql(filters),
			args: queries.count.args(filters)
		})

		if (!result.rows?.[0]){
			throw new Error('Count query returned empty result');
		}

		const {total} = result.rows[0] as unknown as {total:number};

		if (typeof total !== 'number' || total < 0){
			throw new Error('Invalid count value: ' + total);
		}

		return total;
	},

	/**
	 * Actualizar workout
	 * @id id del workout
	 * @userId id del usuario
	 * @data datos del workout a actualizar (title, notes, ejercicios)
	 * @returns workout completo con ejercicios y sets
	 */

	update: async (
		id: string,
		userId:string,
		data: WorkoutUpdateData
	):Promise<WorkoutWithExercises> => {
		// 1. Actualizar datos básicos si hay cambios
		if (data.title || data.notes !== undefined){
			const updateWorkout: Partial<Omit<WorkoutUpdateData, 'exercises'>> = {};
			if (data.title) updateWorkout.title = data.title;
			if (data.notes !== undefined) updateWorkout.notes = data.notes || undefined;

			const fields = Object.keys(updateWorkout);

			if (fields.length > 0) {
				await executeWithRetry((client) =>
					client.execute({
						sql: queries.updateWorkout.sql(fields),
						args: queries.updateWorkout.args(id, userId, updateWorkout),
					})
				);
			}			
		}

		// 2. Si hay ejercicios nuevos, reemplazar todos
		if(data.exercises){
			// Eliminar ejercicios existentes
			await executeWithRetry((client)=>
				client.execute({
					sql: queries.deleteWorkoutExercises.sql,
					args: queries.deleteWorkoutExercises.args(id)
				})
			);

			// Crear nuevos ejercicios y sets
			const allQueries: Array<{sql: string; args: any[]}> = [];

			for (const exercise of data.exercises){
				const workoutExerciseId = uuidv4();

				allQueries.push({
					sql: queries.createWorkoutExercise.sql,
					args: queries.createWorkoutExercise.args(
						workoutExerciseId,
						id,
						exercise.exerciseId,
						exercise.orderIndex
					)
				});

				for(const set of exercise.sets){
					const setId = uuidv4();
					allQueries.push({
						sql: queries.createWorkoutExerciseSet.sql,
						args: queries.createWorkoutExerciseSet.args(
							setId,
							workoutExerciseId,
							set.setNumber,
							set.reps || null,
							set.durationSeconds || null,
							set.restSeconds || null,
							set.weight || null,
							set.notes || null
						),
					})
				}
			}
			await batch(allQueries);
		}

		// 3. Retornar workout actualizado
		const updatedWorkout = await workoutRepository.findById(id, userId);

		if(!updatedWorkout){
			throw new Error('Workout not found after update');
		}

		return updatedWorkout;
	},

	/**
	 * Eliminar workout (cascade elimina exercises y sets)
	 * @workoutId id del workout
	 * @userId id del usuario
	 * @returns void
	 */
	delete: async(workoutId:string, userId: string): Promise<void>=>{
		await executeWithRetry((client)=>
			client.execute({
				sql: queries.deleteWorkout.sql,
				args: queries.deleteWorkout.args(workoutId, userId)
			})
		)
	},

	/**
	 * Verificar si workout pertenece a usuario
	 * @workoutId id del workout
	 * @userId id del usuario
	 * @returns true si pertenece, false si no
	 */
	belongsToUser: async (workoutId: string, userId: string): Promise<boolean> =>{
		const workout = await workoutRepository.findById(workoutId, userId);
		return workout !== null;
	}
}