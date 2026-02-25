// src/repositories/workoutSession.repository.ts

import { batch, execute } from "@/config/database";
import {
  WorkoutSession,
  WorkoutSessionCreateData,
  WorkoutSessionExercise,
  WorkoutSessionExerciseRow,
  WorkoutSessionFilters,
  WorkoutSessionRow,
  WorkoutSessionSet,
  WorkoutSessionSetRow,
  WorkoutSessionStats,
  WorkoutSessionUpdateData,
  WorkoutSessionWithExercises,
  WorkoutSessionWithTemplateName,
  WorkoutSessionWithTemplateNameRow
} from "@/types";
import { castRow, castRows } from "@/utils/castRows.utils";

import { v4 as uuidv4 } from "uuid";

//===========================================
// Helpers
//===========================================

const toDate = (value: string | number): Date => {
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    throw new Error("Invalid date from database");
  }
  return d;
};

//===========================================
// MAPPERS
//===========================================

const mapRowToWorkoutSession = (row: WorkoutSessionRow): WorkoutSession => ({
  id: row.id,
  userId: row.user_id,
  templateId: row.template_id ?? undefined,
  title: row.title,
  notes: row.notes ?? undefined,
  sessionDate: toDate(row.session_date),
  durationMinutes: row.duration_minutes ?? undefined,
  createdAt: toDate(row.created_at),
});

const mapRowToWorkoutSessionWithTemplateName = (row: WorkoutSessionWithTemplateNameRow): WorkoutSessionWithTemplateName => ({
  id: row.id,
  userId: row.user_id,
  templateId: row.template_id ?? undefined,
  title: row.title,
  notes: row.notes ?? undefined,
  sessionDate: toDate(row.session_date),
  durationMinutes: row.duration_minutes ?? undefined,
  createdAt: toDate(row.created_at),
  templateName: row.template_name ?? undefined,
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
  createdAt: toDate(row.created_at),
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
      orderIndex: number
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
    sql: `SELECT * FROM workout_sessions WHERE id = ? AND user_id = ?`,
    args: (id: string, userId: string) => [id, userId]
  },

  findByIdWithTemplateName: {
    sql: `
			SELECT ws.*, wt.name as template_name
			FROM workout_sessions ws
			LEFT JOIN workout_templates wt ON wt.id = ws.template_id
			WHERE ws.id = ? AND ws.user_id = ?
		`,
    args: (id: string, userId: string) => [id, userId]
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
    args: (sessionId: string) => [sessionId]
  },

  findSessionSets: {
    sql: `
			SELECT * FROM workout_session_sets
			WHERE session_exercise_id = ?
			ORDER BY set_number ASC
		`,
    args: (sessionsExerciseId: string) => [sessionsExerciseId]
  },

  findAll: {
    sql: (filters: WorkoutSessionFilters) => {
      let sql = `SELECT ws.* FROM workout_sessions ws`;
      const conditions: string[] = ['ws.user_id = ?'];

      if (filters.templateId) conditions.push('ws.template_id = ?')
      if (filters.startDate) conditions.push('ws.session_date >= ?')
      if (filters.endDate) conditions.push('ws.session_date <= ?')
      if (filters.searchTerm) conditions.push('(ws.title LIKE ? OR ws.notes LIKE ?)')

      sql += ` WHERE ` + conditions.join(' AND ')

      sql += ` ORDER BY ws.session_date DESC LIMIT ? OFFSET ?`
      return sql
    },
    args: (filters: WorkoutSessionFilters, limit: number, offset: number) => {
      const args: any[] = [filters.userId]

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
      const conditions: string[] = ['ws.user_id = ?'];

      if (filters.templateId) conditions.push('ws.template_id = ?')
      if (filters.startDate) conditions.push('ws.session_date >= ?')
      if (filters.endDate) conditions.push('ws.session_date <= ?')
      if (filters.searchTerm) conditions.push('(ws.title LIKE ? OR ws.notes LIKE ?)')

      sql += ` WHERE ` + conditions.join(' AND ')

      return sql
    },
    args: (filters: WorkoutSessionFilters) => {
      const args: any[] = [filters.userId]

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
    sql: (fields: string[]) => `
			UPDATE workout_sessions
			SET ${fields.map(f => `${f} = ?`).join(', ')}
			WHERE id = ? AND user_id = ?
			RETURNING *
		`,
    args: (id: string, userId: string, data: Record<string, any>) => {
      return [...Object.values(data), id, userId]
    }
  },

  deleteSessionExercises: {
    sql: 'DELETE FROM workout_session_exercises WHERE session_id = ?',
    args: (sessionId: string) => [sessionId]
  },

  deleteSession: {
    sql: 'DELETE FROM workout_sessions WHERE id = ? AND user_id = ?',
    args: (id: string, userId: string) => [id, userId]
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
    args: (userId: string) => [userId],
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
    args: (userId: string) => [userId],
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
    exercisesResult.rows.map(async (row) => {
      const sessionExercise = mapRowToWorkoutSessionExercise(row as unknown as WorkoutSessionExerciseRow)

      const setsResult = await execute({
        sql: queries.findSessionSets.sql,
        args: queries.findSessionSets.args(sessionExercise.id)
      })

      const sets = setsResult.rows.map(r =>
        mapRowToWorkoutSessionSet(r as unknown as WorkoutSessionSetRow)
      );

      return { ...sessionExercise, sets }
    })
  )

  return exercises;
}

//===========================================
// Repository
//===========================================

export const workoutSessionRepository = {
  /**
   * Create a new workout session with exercises and sets
   * @param data session data (userId, templateId?, title, notes?, sessionDate, durationMinutes?, exercises)
   * @returns completed session with exercises and sets
   */

  create: async (data: WorkoutSessionCreateData): Promise<WorkoutSessionWithExercises> => {
    const sessionId = uuidv4();

    // Create session
    const sessionResult = await execute({
      sql: queries.createSession.sql,
      args: queries.createSession.args(
        sessionId,
        data.userId,
        data.templateId || null,
        data.title,
        data.notes || null,
        data.sessionDate,
        data.durationMinutes || null
      )
    })

    if (sessionResult.rows.length === 0) {
      throw new Error('Failed to create workout session')
    }

    for (const exerciseData of data.exercises) {

      // Create session exercises
      const sessionExerciseId = uuidv4();

      await execute({
        sql: queries.createSessionExercise.sql,
        args: queries.createSessionExercise.args(
          sessionExerciseId,
          sessionId,
          exerciseData.exerciseId,
          exerciseData.orderIndex
        )
      })

      // Create session exercise sets
      if (exerciseData.sets.length > 0) {
        const setInserts = exerciseData.sets.map(set => ({
          sql: queries.createSessionExerciseSet.sql,
          args: queries.createSessionExerciseSet.args(
            uuidv4(),
            sessionExerciseId,
            set.setNumber,
            set.reps || null,
            set.durationSeconds || null,
            set.weight || null,
            set.restSeconds || null,
            set.notes || null
          )
        }))

        await batch(setInserts)
      }
    }
    const fullSession = await workoutSessionRepository.findById(sessionId, data.userId)

    if (!fullSession) throw new Error('Failed to retrieve workout session')

    return fullSession;

  },

  /**
   * Find a workout session with exercises and sets by id
   * @param id session id
   * @param userId user id
   * @returns workout session with exercises and sets or null
   */
  findById: async (
    id: string,
    userId: string
  ): Promise<WorkoutSessionWithExercises | null> => {
    const result = await execute({
      sql: queries.findByIdWithTemplateName.sql,
      args: queries.findByIdWithTemplateName.args(id, userId)
    })

    const row = result.rows[0] as WorkoutSessionWithTemplateNameRow | undefined;

    if (!row) return null;

    const session = mapRowToWorkoutSessionWithTemplateName(row);
    const exercises = await getSessionExercisesWithSets(id)

    return {
      ...session,
      exercises,
      templateName: session.templateName
    }

  },

  /**
   * find base session by id (without exercises and sets)
   * @param id session id
   * @param userId user id
   * @return session base or null
   */
  findBaseSessionById: async (
    id: string,
    userId: string
  ): Promise<WorkoutSession | null> => {
    const result = await execute({
      sql: queries.findById.sql,
      args: queries.findById.args(id, userId)
    })

    const row = result.rows[0] as WorkoutSessionRow | undefined;
    if (!row) return null;
    return mapRowToWorkoutSession(row);
  },

  /**
   * list workout sessions by filters
   * @param filters (userId, templateId?, startDate?, endDate?, searchTerm?)
   * @param page page number
   * @param limit number of sessions per page
   * @returns list of workout sessions (without exercises and sets)
   */
  findAll: async (
    filters: WorkoutSessionFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<WorkoutSession[]> => {
    const offset = (page - 1) * limit;

    const result = await execute({
      sql: queries.findAll.sql(filters),
      args: queries.findAll.args(filters, limit, offset)
    });

    if (result.rows.length === 0) return [];

    const workoutSessionRows = castRows<WorkoutSessionRow>(result.rows);

    const workoutSessions = workoutSessionRows.map(row =>
      mapRowToWorkoutSession(row)
    )

    return workoutSessions;

  },

  /**
   * Count total workout sessions by filters (userId, templateId?, startDate?, endDate?, searchTerm?)
   * @param filters filters (userId, templateId?, startDate?, endDate?, searchTerm?)
   * @return total number of workout sessions matching the filters
   */
  count: async (filters: WorkoutSessionFilters): Promise<number> => {
    const result = await execute({
      sql: queries.count.sql(filters),
      args: queries.count.args(filters)
    })

    if (!result.rows[0]) {
      throw new Error('Count query returned empty result')
    }

    const { total } = castRow<{ total: number }>(result.rows[0])

    if (typeof total !== 'number' || total < 0) {
      throw new Error('Invalid count value ' + total)
    }
    return total;
  },

  /**
   * Update workout session
   * @param id id of the session to update
   * @param userId id of the user
   * @param data fields to update (title?, notes?, sessionDate?, durationMinutes?)
   * @return sesión actualizada con ejercicios y sets
   */
  update: async (
    id: string,
    userId: string,
    data: WorkoutSessionUpdateData
  ): Promise<WorkoutSessionWithExercises> => {
    const updateData: Record<string, any> = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.sessionDate !== undefined) updateData.session_date = data.sessionDate.toISOString()
    if (data.durationMinutes !== undefined) updateData.duration_minutes = data.durationMinutes

    const fields = Object.keys(updateData)

    if (fields.length > 0) {
      await execute({
        sql: queries.updateSession.sql(fields),
        args: queries.updateSession.args(id, userId, updateData)
      })
    }

    if (data.exercises !== undefined) {
      await execute({
        sql: queries.deleteSessionExercises.sql,
        args: queries.deleteSessionExercises.args(id)
      })

      for (const exerciseData of data.exercises) {
        const sessionExerciseId = uuidv4();

        await execute({
          sql: queries.createSessionExercise.sql,
          args: queries.createSessionExercise.args(
            sessionExerciseId,
            id,
            exerciseData.exerciseId,
            exerciseData.orderIndex
          )
        })

        if (exerciseData.sets.length > 0 ) {
          const setInserts = exerciseData.sets.map(set => ({
            sql: queries.createSessionExerciseSet.sql,
            args: queries.createSessionExerciseSet.args(
              uuidv4(),
              sessionExerciseId,
              set.setNumber,
              set.reps || null,
              set.durationSeconds || null,
              set.weight || null,
              set.restSeconds || null,
              set.notes || null                
            )
          }))
          await batch(setInserts)
        }
      }
    }

    const updatedSession = await workoutSessionRepository.findById(id, userId)
    if (!updatedSession) {
      throw new Error('Failed to retrieve updated workout session')
    }

    return updatedSession;
  },

  /**
   * delete workout session by id
   * @param id session id
   * @param userId user id
   * @return void
   */
  delete: async (id: string, userId: string):Promise<void> => {
    await execute({
      sql: queries.deleteSession.sql,
      args: queries.deleteSession.args(id, userId)
    })

  },

  /**
   * get workout session stats for a user
   * @param userId user id
   * @return totalSessions, totalDuration, averageDuration, sessionsThisWeek, 
   *  sessionsThisMonth, mostUsedTemplate { templateId, templateName, usageCount }
   */
  getStats: async (userId: string) : Promise<WorkoutSessionStats> =>{
    
    const [statsResult, templateResult] = await Promise.all([
      execute({
        sql: queries.getStats.sql,
        args: queries.getStats.args(userId)
      }),
      execute({
        sql: queries.getMostUsedTemplate.sql,
        args: queries.getMostUsedTemplate.args(userId)
      })
    ])

    const statsRow = statsResult.rows[0] as any
    const templateRow = templateResult.rows[0] as any

    const stats: WorkoutSessionStats = {
      totalSessions: statsRow.total_sessions,
      totalDuration: statsRow.total_duration,
      averageDuration: Math.round(statsRow.average_duration),
      sessionsThisWeek: statsRow.sessions_this_week,
      sessionsThisMonth: statsRow.sessions_this_month,
      mostUsedTemplate: templateRow 
        ? {
          templateId: templateRow.template_id,
          templateName: templateRow.template_name,
          usageCount: templateRow.usage_count
          }
        : undefined
    }

    return stats;
  },

  /**
   * verify if a session belongs to a user
   * @param id session id
   * @param userId user id
   * @return true if the session belongs to the user, false otherwise
   */
  belongsToUser: async ( id: string, userId: string):Promise<boolean> => {
    const session = await workoutSessionRepository.findBaseSessionById(id, userId)
    return session !== null;
  }



}