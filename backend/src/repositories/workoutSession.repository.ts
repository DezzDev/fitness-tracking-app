// src/repositories/workoutSession.repository.ts

import { batch, execute } from "@/config/database";
import {
	WorkoutSession,
	WorkoutSessionExercise,
	WorkoutSessionExerciseCreateData,
	WorkoutSessionExerciseRow,
	WorkoutSessionFilters,
	WorkoutSessionRow,
	WorkoutSessionSet,
	WorkoutSessionSetCrateData,
	WorkoutSessionSetRow,
	WorkoutSessionStats,
	WorkoutSessionUpdateData,
	WorkoutSessionWithExercises
} from "@/types";
import { v4 as uuidv4 } from "uuid";

//===========================================
// MAPPERS
//===========================================

const mapRowToWorkoutSession = (row: WorkoutSessionRow): WorkoutSession => ({
	id: row.id,
	userId: row.user_id,
	templateId: row.template_id ?? undefined,
	title: row.title,
	notes: row.notes ?? undefined,
	sessionDate: new Date(row.session_date),
	durationMinutes: row.duration_minutes ?? undefined,
	createdAt: new Date(row.created_at),
});

const mapRowToWorkoutSessionExercise = (row: WorkoutSessionExerciseRow): Omit<WorkoutSessionExercise, 'sets'> => ({
	id: row.id,
	sessionId: row.session_id,
	exerciseId: row.exercise_id,
	orderIndex: row.order_index,
	exerciseName: row.exercise_name,
	exerciseDescription: row.exercise_description ?? undefined,
	difficulty: row.difficulty ?? undefined,
	muscleGroup: row.muscle_group ?? undefined,
	type: row.type ?? undefined,
});

const mapRowToWorkoutSessionSet = (row: WorkoutSessionSetRow): WorkoutSessionSet => ({
	id: row.id,
	sessionExerciseId: row.session_exercise_id,
	setNumber: row.set_number,
	reps: row.reps ?? undefined,
	durationSeconds: row.duration_seconds ?? undefined,
	weight: row.weight ?? undefined,
	restSeconds: row.rest_seconds ?? undefined,
	notes: row.notes ?? undefined,
	createdAt: new Date(row.created_at),
});

//===========================================
// QUERIES
//===========================================

const queries = {

	createSession: {
		sql: `
			INSERT INTO workout_sessions 
				(id, user_id, template_id, title, notes, session_date, duration_minutes, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
			RETURNING *
		`,
		args: (
			id: string,
			userId: string,
			templateId: string | null,
			title: string,
			notes: string | null,
			sessionDate: Date,
			durationMinutes: number | null
		) => [ id, userId, templateId, title, notes, sessionDate.toISOString(), durationMinutes ]
	},

	createSessionExercise: {
		sql: `
			INSERT INTO workout_session_exercises
				(id, session_id, exercise_id, order_index)
			VALUES (?, ?, ?, ?)
			RETURNING *
		`,
		args: (
			id: string,
			sessionId: string,
			exerciseId: string,
			orderIndex: number
		) => [ id, sessionId, exerciseId, orderIndex ]
	},

	createSessionExerciseSet: {
		sql: `
			INSERT INTO workout_session_sets
				(id, session_exercise_id, set_number, reps, duration_seconds, weight, rest_seconds, notes, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
			RETURNING *
		`,
		args: (
			id: string,
			sessionExerciseId: string,
			setNumber: number,
			reps: number | null,
			durationSeconds: number | null,
			weight: number | null,
			restSeconds: number | null,
			notes: string | null
		) => [ id, sessionExerciseId, setNumber, reps, durationSeconds, weight, restSeconds, notes ]

	},

	findById: {
		sql: `SELECT * FROM workout_sessions WHERE id = ? AND user_id = ?`,
		args: (id: string, userId: string) => [ id, userId ]
	},

	findByIdWithTemplateName: {
		sql: `
			SELECT ws.*, wt.name as template_name
			FROM workout_sessions ws
			LEFT JOIN workout_templates wt ON wt.id = ws.template_id
			WHERE ws.id = ? AND ws.user_id = ?
		`,
		args: (id: string, userId: string) => [ id, userId ]
	},

	findSessionExercises: {
		sql: `
			SELECT 
				wse.*,
				e.name as exercise_name,
				e.description as exercise_description,
				e.difficulty,
				e.muscle_group,
				e.type
			FROM workout_session_exercises wse
			INNER JOIN exercises e ON e.id = wse.exercise_id
			WHERE wse.session_id = ?
			ORDER BY wse.order_index ASC
		`,
		args: (sessionId: string) => [ sessionId ]
	},

	findSessionSets: {
		sql: `
			SELECT * FROM workout_session_sets
			WHERE session_exercise_id = ?
			ORDER BY set_number ASC
		`,
		args: (sessionsExerciseId: string) => [ sessionsExerciseId ]
	},

	findAll: {
		sql: (filters: WorkoutSessionFilters) => {
			let sql = `SELECT ws.* FROM workout_sessions ws`;
			const conditions: string[] = [ 'ws.user_id = ?' ];

			if (filters.templateId) conditions.push('ws.template_id = ?')
			if (filters.startDate) conditions.push('ws.session_date >= ?')
			if (filters.endDate) conditions.push('ws.session_date <= ?')
			if (filters.searchTerm) conditions.push('(ws.title LIKE ? OR ws.notes LIKE ?)')

			sql += ` WHERE ` + conditions.join(' AND ')

			sql += ` ORDER BY ws.session_date DESC LIMIT ? OFFSET ?`
			return sql
		},
		args: (filters: WorkoutSessionFilters, limit: number, offset: number) => {
			const args: any[] = [ filters.userId ]

			if (filters.templateId) args.push(filters.templateId)
			if (filters.startDate) args.push(filters.startDate.toISOString())
			if (filters.endDate) args.push(filters.endDate.toISOString())
			if (filters.searchTerm) {
				const searchPattern = `%${filters.searchTerm}%`
				args.push(searchPattern, searchPattern)
			}

			args.push(limit, offset)
			return args
		}

	},

	count: {
		sql: (filters: WorkoutSessionFilters) => {
			let sql = `SELECT COUNT(*) as total FROM workout_session ws)`
			const conditions: string[] = [ 'ws.user_id = ?' ];

			if (filters.templateId) conditions.push('ws.template_id = ?')
			if (filters.startDate) conditions.push('ws.session_date >= ?')
			if (filters.endDate) conditions.push('ws.session_date <= ?')
			if (filters.searchTerm) conditions.push('(ws.title LIKE ? OR ws.notes LIKE ?)')

			sql += ` WHERE ` + conditions.join(' AND ')

			return sql
		},
		args: (filters: WorkoutSessionFilters) => {
			const args: any[] = [ filters.userId ]

			if (filters.templateId) args.push(filters.templateId)
			if (filters.startDate) args.push(filters.startDate.toISOString())
			if (filters.endDate) args.push(filters.endDate.toISOString())
			if (filters.searchTerm) {
				const searchPattern = `%${filters.searchTerm}%`
				args.push(searchPattern, searchPattern)
			}

			return args
		}
	},

	updateSession: {
		sql: (fields: string[])=>`
			UPDATE workout_sessions
			SET ${fields.map(f=> `${f} = ?`).join(', ')}
			WHERE id = ? AND user_id = ?
			RETURNING *
		`,
		args: (id: string, userId: string, data: Record<string, any>) =>{
			return [ ...Object.values(data), id, userId ]
		}
	},

	deleteSessionExercises: {
		sql: 'DELETE FROM workout_session_exercises WHERE session_id = ?',
		args: (sessionId: string) => [ sessionId ]
	},

	deleteSession: {
		sql: 'DELETE FROM workout_sessions WHERE id = ? AND user_id = ?',
		args: (id: string, userId: string) => [ id, userId ]
	},

	getStats: {
		sql: `
			SELECT
				COUNT(*) as total_sessions,
				COALESCE(SUM(duration_minutes), 0) as total_duration,
				COALESCE(AVG(duration_minutes), 0) as average_duration,
				COUNT(CASE WHEN session_date >= date('now', '-7 days') THEN 1 END) as sessions_this_week,
				COUNT(CASE WHEN session_date >= date('now', 'start of month') THEN 1 END) as sessions_this_month
			FROM workout_sessions
			WHERE user_id = ?
		`,
		args: (userId: string) => [ userId ],
	},

	getMostUsedTemplate: {
		sql: `
			SELECT
				ws.template_id,
				wt.name as template_name,
				COUNT(*) as usage_count
			FROM workout_sessions ws
			INNER JOIN workout_templates wt ON ws.template_id = wt.id
			WHERE ws.user_id = ? AND ws.template_id IS NOT NULL
			GROUP BY ws.template_id, wt.name
			ORDER BY usage_count DESC
			LIMIT 1
		`,
		args: (userId: string) => [ userId ],
	},

}

//===========================================
// Helpers internos
//===========================================

const getSessionExercisesWithSets = async (
	sessionId: string
): Promise<WorkoutSessionExercise[]> => {

	const exercisesResult = await execute({
		sql: queries.findSessionExercises.sql,
		args: queries.findSessionExercises.args(sessionId)
	});

	if (exercisesResult.rows.length === 0) return [];

	const exercises = await Promise.all(
		exercisesResult.rows.map( async(row) => {
			const sessionExercise = mapRowToWorkoutSessionExercise(row as unknown as WorkoutSessionExerciseRow)

			const setsResult = await execute({
				sql: queries.findSessionSets.sql,
				args: queries.findSessionSets.args(sessionExercise.id)
			})

			const sets = setsResult.rows.map(r => 
				mapRowToWorkoutSessionSet( r as unknown as WorkoutSessionSetRow)
			);

			return { ...sessionExercise, sets}
		})
	)

	return exercises;
}