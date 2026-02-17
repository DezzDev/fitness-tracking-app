// src/repositories/workoutSession.repository.ts

import {batch, execute} from "@/config/database";
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
import {v4 as uuidv4} from "uuid";

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
		) => [id, userId, templateId, title, notes, sessionDate.toISOString(), durationMinutes]
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
			orderIndex:number
		) => [id, sessionId, exerciseId, orderIndex]
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
		) => [id, sessionExerciseId, setNumber, reps, durationSeconds, weight, restSeconds, notes]
		
	},

	findById: {
		sql:`
		`
	}
}