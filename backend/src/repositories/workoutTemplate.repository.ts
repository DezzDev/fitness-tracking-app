// src/repositories/workoutTemplate.repository.ts
import { batch, execute } from "@/config/database";
import {
	WorkoutTemplate,
	WorkoutTemplateCreateData,
	WorkoutTemplateExercise,
	WorkoutTemplateExerciseRow,
	WorkoutTemplateFilters,
	WorkoutTemplateRow,
	WorkoutTemplateUpdateData,
	WorkoutTemplateWithExercises
} from "@/types";
import logger from "@/utils/logger";
import { v4 as uuidv4 } from "uuid";
import type { ResultSet } from "@libsql/client";


// ============================================
// Types
// ============================================

type usageStats = {
	usageCount: number,
	lastUsedAt?: Date
}

// ============================================
// Helpers
// ============================================

const toNumber = (value: unknown, defaultValue = 0): number => {
	const n = Number(value);
	return Number.isFinite(n) ? n : defaultValue
}

const toData = (value: unknown): Date | undefined => {
	if (value === null) return undefined;
	const d = new Date(String(value));
	return isNaN(d.getTime()) ? undefined : d;
}

// ============================================
// Mappers
// ============================================

const mapRowToWorkoutTemplate = (row: WorkoutTemplateRow): WorkoutTemplate => ({
	id: row.id,
	userId: row.user_id,
	name: row.name,
	description: row.description ?? undefined,
	scheduledDayOfWeek: row.scheduled_day_of_week ?? undefined,
	createdAt: new Date(row.created_at),
	updatedAt: new Date(row.updated_at),
	deletedAt: row.deleted_at ? new Date(row.deleted_at) : undefined,
})

const mapRowToWorkoutTemplateExercise = (row: WorkoutTemplateExerciseRow): WorkoutTemplateExercise => ({
	id: row.id,
	templateId: row.template_id,
	exerciseId: row.exercise_id,
	orderIndex: row.order_index,
	suggestedSets: row.suggested_sets ?? undefined,
	suggestedReps: row.suggested_reps ?? undefined,
	notes: row.notes ?? undefined,
	exerciseName: row.exercise_name,
	exerciseDescription: row.exercise_description ?? undefined,
	difficulty: row.difficulty ?? undefined,
	muscleGroup: row.muscle_group ?? undefined,
	type: row.type ?? undefined,
})

const mapRowToUsageStats = (result: ResultSet): usageStats => {
	const row = result.rows[ 0 ]
	if (!row) return { usageCount: 0 }

	return {
		usageCount: toNumber(row.usage_count),
		lastUsedAt: toData(row.last_used_at),
	}
}


// ============================================
// QUERIES
// ============================================

const queries = {
	createWorkoutTemplate: {
		sql: `
			INSERT INTO workout_templates (id, user_id, name, description, scheduled_day_of_week, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
			RETURNING *
		`,
		args: (id: string, userId: string, name: string, description: string | null, scheduledDayOfWeek: number | null) => [
			id, userId, name, description, scheduledDayOfWeek
		]
	},

	createWorkoutTemplateExercise: {
		sql: `
			INSERT INTO workout_template_exercises (id, template_id, exercise_id, order_index, suggested_sets, suggested_reps, notes)
			VALUES (?, ?, ?, ?, ?, ?, ?)
			RETURNING *
		`,
		args: (
			id: string,
			templateId: string,
			exerciseId: string,
			orderIndex: number,
			suggestedSets: number | null,
			suggestedReps: number | null,
			notes: string | null
		) => [
				id, templateId, exerciseId, orderIndex, suggestedSets, suggestedReps, notes
			]
	},

	findById: {
		sql: `
			SELECT id, user_id, name, description, scheduled_day_of_week, created_at, updated_at, deleted_at
			FROM workout_templates
			WHERE id = ? AND deleted_at IS NULL
		`,
		args: (id: string) => [ id ]
	},

	findByIdWithExercises: {
		sql: `
		 SELECT wt.id, wt.user_id, wt.name, wt.description, wt.scheduled_day_of_week, wt.created_at, wt.updated_at, wt.deleted_at,
		 	      wte.id as exercise_id, wte.template_id, wte.exercise_id as exercise_template_id,
					wte.order_index, wte.suggested_sets, wte.suggested_reps, wte.notes as exercise_notes,
					e.name as exercise_name, e.description as exercise_description, e.difficulty, e.muscle_group, e.type
			FROM workout_templates wt
			LEFT JOIN workout_template_exercises wte on wt.id = wte.template_id
			LEFT JOIN exercises e on wte.exercise_id = e.id
			WHERE wt.id = ? AND wt.user_id = ? AND wt.deleted_at IS NULL
			ORDER BY wte.order_index ASC
		`,
		args: (id: string, userId: string) => [ id, userId ]
	},

	findAll: {
		sql: (filters: WorkoutTemplateFilters) => {
			let sql = `SELECT * FROM workout_templates wt`;

			if (filters.favoritesOnly) {
				sql += ` INNER JOIN template_favorites tf on wt.id = tf.template_id`
			}
			sql += ` WHERE wt.user_id = ?`;
			if (filters.startDate) {
				sql += ` AND created_at >= datetime(?)`
			}
			if (filters.endDate) {
				sql += ` AND created_at <= datetime(?)`
			}
			if (filters.searchTerm) {
				sql += ` AND (name LIKE ? OR description LIKE ?)`
			}
			sql += ` ORDER BY wt.created_at DESC LIMIT ? OFFSET ?`;
			return sql;
		},
		args: (filters: WorkoutTemplateFilters, limit: number, offset: number) => {
			const args: any[] = [ filters.userId ]

			if (filters.startDate) {
				args.push(filters.startDate.toISOString())
			}
			if (filters.endDate) {
				args.push(filters.endDate.toISOString())
			}
			if (filters.searchTerm) {
				const searchPattern = `%${filters.searchTerm}%`
				args.push(searchPattern, searchPattern)
			}

			args.push(limit, offset)
			return args
		}
	},

	findWorkoutTemplateExercises: {
		sql: `
			SELECT wte.*, 
				e.name as exercise_name,
				e.description as exercise_description,
				e.difficulty,
				e.muscle_group,
				e.type
			FROM workout_template_exercises wte
			INNER JOIN exercises e ON wte.exercise_id = e.id
			WHERE wte.template_id = ?
			ORDER BY wte.order_index ASC
		`,
		args: (templateId: string) => [ templateId ]
	},

	workoutTemplateUpdate: {
		sql: (fields: string[]) => `
			UPDATE workout_templates
			SET ${fields.map(f => `${f} = ?`).join(', ')}, updated_at = datetime('now')
			WHERE id = ? AND user_id = ?
			RETURNING *
		`,
		args: (id: string, userId: string, data: Partial<Omit<WorkoutTemplateUpdateData, 'exercises'>>) => {
			const values = Object.values(data);
			return [ ...values, id, userId ]
		}
	},

	// elimina todos los ejercicios de un template
	deleteWorkoutTemplateExercises: {
		sql: `DELETE FROM workout_template_exercises WHERE template_id = ?`,
		args: (templateId: string) => [ templateId ]
	},

	// eliminar workout template (cascade eliminará templateExercises)
	deleteWorkoutTemplate: {
		sql: `DELETE FROM workout_templates WHERE id = ? AND user_id = ?`,
		args: (id: string, userId: string) => [ id, userId ]
	},

	// agregar favorito
	addFavorite: {
		sql: `
			INSERT INTO template_favorites (user_id, template_id, created_at)
			VALUES (?, ?, datetime('now'))
		`,
		args: (userId: string, templateId: string) => [ userId, templateId ]
	},

	// obtener favoritos
	isFavorite: {
		sql: `
			SELECT EXISTS (
				SELECT 1 
				FROM template_favorites
				WHERE user_id = ? AND template_id = ?
			) AS is_favorite
		`,
		args: (userId: string, templateId: string) => [ userId, templateId ]
	},

	// eliminar favorito
	deleteFavorite: {
		sql: `
			DELETE FROM template_favorites
			WHERE user_id = ? AND template_id = ?
		`,
		args: (userId: string, templateId: string) => [ userId, templateId ]
	},

	// obtener uso de template
	getUsageStats: {
		sql: `
			SELECT 
				template_id, 
				COUNT(*) as usage_count,
				MAX(created_at) as last_used_at
			FROM workout_sessions
			WHERE template_id = ?
			GROUP BY template_id
		`,
		args: (templateId: string) => [ templateId ]
	},

	// encontrar templates por día de la semana programado
	findByScheduledDay: {
		sql: `
			SELECT id, user_id, name, description, scheduled_day_of_week, created_at, updated_at, deleted_at
			FROM workout_templates
			WHERE user_id = ? AND scheduled_day_of_week = ? AND deleted_at IS NULL
			ORDER BY created_at DESC
		`,
		args: (userId: string, dayOfWeek: number) => [ userId, dayOfWeek ]
	}
}

// ============================================
// REPOSITORY
// ============================================

export const workoutTemplateRepository = {
	create: async (data: WorkoutTemplateCreateData): Promise<WorkoutTemplateWithExercises> => {
		const templateId = uuidv4();

		// Crear template
		const templateResult = await execute({
			sql: queries.createWorkoutTemplate.sql,
			args: queries.createWorkoutTemplate.args(templateId, data.userId, data.name, data.description || null, data.scheduledDayOfWeek ?? null)
		})

		if (templateResult.rows.length === 0) {
			throw new Error('Failed to create workout template');
		}
		logger.info('template created')

		const template = mapRowToWorkoutTemplate(templateResult.rows[ 0 ] as unknown as WorkoutTemplateRow);

		// Crear template exercises (ejercicios del template) 
		const allQueries: Array<{ sql: string, args: any[] }> = []
		for (const exercise of data.exercises) {
			const templateExerciseId = uuidv4();
			// query para crear template exercise
			allQueries.push({
				sql: queries.createWorkoutTemplateExercise.sql,
				args: queries.createWorkoutTemplateExercise.args(
					templateExerciseId,
					template.id,
					exercise.exerciseId,
					exercise.orderIndex,
					exercise.suggestedSets ?? null,
					exercise.suggestedReps ?? null,
					exercise.notes ?? null
				)
			})
		}

		// ejecutar todas las queries en batch
		await batch(allQueries)

		// Obtener template completo con ejercicios
		const templateWithExercises = await workoutTemplateRepository.findById(template.id)

		if (!templateWithExercises) {
			throw new Error('Failed to retrieve created workout template');
		}
		return templateWithExercises;

	},

	findById: async (id: string): Promise<WorkoutTemplateWithExercises | null> => {

		// Obtener template 
		const workoutTemplateResult = await execute({
			sql: queries.findById.sql,
			args: queries.findById.args(id)
		})

		if (workoutTemplateResult.rows.length === 0) {
			return null;
		}

		const workoutTemplate = mapRowToWorkoutTemplate(workoutTemplateResult.rows[ 0 ] as unknown as WorkoutTemplateRow);

		// Buscar todos los ejercicios del template
		const templateExercisesResult = await execute({
			sql: queries.findWorkoutTemplateExercises.sql,
			args: queries.findWorkoutTemplateExercises.args(id)
		})

		const templateExercises: WorkoutTemplateExercise[] = templateExercisesResult.rows.map(
			row => mapRowToWorkoutTemplateExercise(row as unknown as WorkoutTemplateExerciseRow)
		)

		// Comprobar si el template es favorito
		const isFavoriteResult = await execute({
			sql: queries.isFavorite.sql,
			args: queries.isFavorite.args(workoutTemplate.userId, workoutTemplate.id)
		})

		const favoriteRow = isFavoriteResult.rows[ 0 ]
		const isFavorite = typeof favoriteRow?.is_favorite === 'number' && favoriteRow.is_favorite === 1

		// Obtener uso del template
		const usageCountResult = await execute({
			sql: queries.getUsageStats.sql,
			args: queries.getUsageStats.args(workoutTemplate.id)
		})

		const usageStats = mapRowToUsageStats(usageCountResult)

		return {
			...workoutTemplate,
			exercises: templateExercises,
			isFavorite,
			usageCount: usageStats.usageCount,
			lastUsedAt: usageStats.lastUsedAt

		}
	},

	findAll: async (
		filters: WorkoutTemplateFilters,
		page: number = 1,
		limit: number = 10
	): Promise<WorkoutTemplateWithExercises[]> => {
		const offset = (page - 1) * limit;

		const result = await execute({
			sql: queries.findAll.sql(filters),
			args: queries.findAll.args(filters, limit, offset)
		})

		const templates: WorkoutTemplateWithExercises[] = [];
		for (const row of result.rows) {
			const templateId = String(row.id);
			const template = await workoutTemplateRepository.findById(templateId);
			if (template) {
				templates.push(template);
			}
		}

		return templates;
	},

	count: async (filters: WorkoutTemplateFilters): Promise<number> => {
		let sql = `SELECT COUNT(*) as count FROM workout_templates wt`;
		const args: any[] = [ filters.userId ];

		if (filters.favoritesOnly) {
			sql += ` INNER JOIN template_favorites tf on wt.id = tf.template_id`;
		}

		sql += ` WHERE wt.user_id = ?`;

		if (filters.startDate) {
			sql += ` AND wt.created_at >= datetime(?)`;
			args.push(filters.startDate.toISOString());
		}

		if (filters.endDate) {
			sql += ` AND wt.created_at <= datetime(?)`;
			args.push(filters.endDate.toISOString());
		}

		if (filters.searchTerm) {
			sql += ` AND (wt.name LIKE ? OR wt.description LIKE ?)`;
			const searchPattern = `%${filters.searchTerm}%`;
			args.push(searchPattern, searchPattern);
		}

		const result = await execute({
			sql,
			args
		});

		const count = result.rows[ 0 ]?.count;
		return typeof count === 'number' ? count : Number(count ?? 0);
	},

	update: async (
		id: string,
		userId: string,
		data: WorkoutTemplateUpdateData
	): Promise<WorkoutTemplateWithExercises> => {
		const fields: string[] = [];
		const updateData: Partial<Omit<WorkoutTemplateUpdateData, 'exercises'>> = {};

		if (typeof data.name !== 'undefined') {
			fields.push('name');
			updateData.name = data.name;
		}

		if (typeof data.description !== 'undefined') {
			fields.push('description');
			updateData.description = data.description;
		}

		if (typeof data.scheduledDayOfWeek !== 'undefined') {
			fields.push('scheduled_day_of_week');
			updateData.scheduledDayOfWeek = data.scheduledDayOfWeek;
		}

		if (fields.length > 0) {
			const updatedTemplateResult = await execute({
				sql: queries.workoutTemplateUpdate.sql(fields),
				args: queries.workoutTemplateUpdate.args(id, userId, updateData)
			});

			if (updatedTemplateResult.rows.length === 0) {
				throw new Error('Template not found or unauthorized');
			}
		}

		if (data.exercises) {
			await execute({
				sql: queries.deleteWorkoutTemplateExercises.sql,
				args: queries.deleteWorkoutTemplateExercises.args(id)
			});

			const exerciseQueries = data.exercises.map((exercise) => ({
				sql: queries.createWorkoutTemplateExercise.sql,
				args: queries.createWorkoutTemplateExercise.args(
					uuidv4(),
					id,
					exercise.exerciseId,
					exercise.orderIndex,
					exercise.suggestedSets ?? null,
					exercise.suggestedReps ?? null,
					exercise.notes ?? null,
				)
			}));

			if (exerciseQueries.length > 0) {
				await batch(exerciseQueries);
			}
		}

		const updatedTemplate = await workoutTemplateRepository.findById(id);
		if (!updatedTemplate) {
			throw new Error('Failed to retrieve updated template');
		}

		return updatedTemplate;
	},

	delete: async (id: string, userId: string): Promise<void> => {
		await execute({
			sql: queries.deleteWorkoutTemplate.sql,
			args: queries.deleteWorkoutTemplate.args(id, userId)
		});
	},

	isFavorite: async (userId: string, templateId:string): Promise<boolean> => {
		const favoriteRow = await execute({
			sql: queries.isFavorite.sql,
			args: queries.isFavorite.args(userId, templateId)
		})
		const row = favoriteRow.rows[0]
		const isFavorite = typeof row?.is_favorite === 'number' && row.is_favorite === 1

		return isFavorite
	},

	addFavorite: async (userId: string, templateId: string): Promise<void> => {
		await execute({
			sql: queries.addFavorite.sql,
			args: queries.addFavorite.args(userId, templateId)
		})
	},

	removeFavorite: async (userId: string, templateId: string): Promise<void> => {
		await execute({
			sql: queries.deleteFavorite.sql,
			args: queries.deleteFavorite.args(userId, templateId)
		})
	},

	findByScheduledDay: async (userId: string, dayOfWeek: number): Promise<WorkoutTemplateWithExercises[]> => {
		const result = await execute({
			sql: queries.findByScheduledDay.sql,
			args: queries.findByScheduledDay.args(userId, dayOfWeek)
		});

		const templates = result.rows.map(row => mapRowToWorkoutTemplate(row as unknown as WorkoutTemplateRow));
		
		// Enriquecer cada template con exercises, isFavorite, y usageStats
		const enrichedTemplates = await Promise.all(
			templates.map(async (template) => {
				// Buscar ejercicios del template
				const templateExercisesResult = await execute({
					sql: queries.findWorkoutTemplateExercises.sql,
					args: queries.findWorkoutTemplateExercises.args(template.id)
				});

				const exercises = templateExercisesResult.rows.map(
					row => mapRowToWorkoutTemplateExercise(row as unknown as WorkoutTemplateExerciseRow)
				);

				// Comprobar si es favorito
				const isFavoriteResult = await execute({
					sql: queries.isFavorite.sql,
					args: queries.isFavorite.args(userId, template.id)
				});

				const favoriteRow = isFavoriteResult.rows[0];
				const isFavorite = typeof favoriteRow?.is_favorite === 'number' && favoriteRow.is_favorite === 1;

				// Obtener estadísticas de uso
				const usageCountResult = await execute({
					sql: queries.getUsageStats.sql,
					args: queries.getUsageStats.args(template.id)
				});

				const usageStats = mapRowToUsageStats(usageCountResult);

				return {
					...template,
					exercises,
					isFavorite,
					usageCount: usageStats.usageCount,
					lastUsedAt: usageStats.lastUsedAt
				};
			})
		);

		return enrichedTemplates;
	}
}
