// src/repositories/exercise.repository.ts
import { execute, executeWithRetry, batch } from '@/config/database'
import {
	Exercise,
	ExerciseWithTags,
	Tag,
	ExerciseCreateData,
	ExerciseUpdateData,
	ExerciseRow,
	TagRow,
	ExerciseFilters
} from '@/types';
import { v4 as uuidv4 } from 'uuid';
import ta from 'zod/v4/locales/ta.js';

// ============================================
// MAPPERS 
// ============================================

const mapRowToExercise = (row: ExerciseRow): Exercise => ({
	id: row.id,
	name: row.name,
	description: row.description || undefined,
	difficulty: row.difficulty as any,
	muscleGroup: row.muscle_group || undefined,
	type: row.type as any,
	createdAt: new Date(row.created_at),
});

const mapRowToTag = (row: TagRow): Tag => ({
	id: row.id,
	name: row.name,
})

// ============================================
// QUERIES 
// ============================================

const queries = {
	// Crear exercise
	createExercise: {
		sql: `
			INSERT INTO exercises (id, name, description, difficulty, muscle_group, type, created_at)
			VALUES (?, ?, ?, ?, ?, ?, datetime('now))
			RETURNING *
		`,
		args: (
			id: string,
			name: string,
			description: string | null,
			difficulty: string | null,
			muscle_group: string | null,
			type: string | null
		) => [ id, name, description, difficulty, muscle_group, type ]
	},

	// Crear relación exercise-tag
	createExerciseTag: {
		sql: `
			INSERT INTO exercise_tags (exercise_id, tag_id)
			VALUES (?, ?)
		`,
		args: (exerciseId: string, tagId: string) => [ exerciseId, tagId ]
	},

	// Buscar exercise por ID
	findById: {
		sql: `SELECT * FROM exercises WHERE id = ?`,
		args: (id: string) => [ id ]
	},

	// Buscar exercise por Nombre
	findByName: {
		sql: `SELECT * FROM exercises WHERE LOWER(name) = LOWER(?)`,
		args: (name: string) => [ name ]
	},

	// Buscar tags de un exercise
	findExerciseTags: {
		sql: `
			SELECT t.* FROM tags t
			INNER JOIN exercise_tags et ON t.id = et.tag_id
			WHERE et.exercise_id = ?
			ORDER BY t.name ASC 
		`,
		args: (exerciseId: string) => [ exerciseId ]
	},

	// Listar exercises con filtros
	findAll: {
		sql: (filters: ExerciseFilters) => {
			let sql = 'SELECT DISTINCT e.* FROM exercises e';

			// Join con tags si se filtra por tag
			if (filters.tagIDs && filters.tagIDs.length > 0) {
				sql += ' INNER JOIN exercise_tags et ON e.id = et.exercise_id';
			}

			sql += ` WHERE 1=1`;

			if (filters.difficulty) {
				sql += ' AND e.difficulty = ?';
			}

			if (filters.muscleGroup) {
				sql += ' AND e.muscle_group = ?';
			}

			if (filters.type) {
				sql += ' AND e.type = ?';
			}

			if (filters.tagIDs && filters.tagIDs.length > 0) {
				sql += ` AND et.tag_id IN (${filters.tagIDs.map(() => '?').join(',')})`;
			}

			if (filters.searchTerm) {
				sql += ' AND (e.name LIKE ? OR e.description LIKE ?)'
			}

			sql += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';

			return sql;
		},
		args: (filters: ExerciseFilters, limit: number, offset: number) => {
			const args: any[] = [];

			if (filters.difficulty) {
				args.push(filters.difficulty);
			}
			if (filters.muscleGroup) {
				args.push(filters.muscleGroup);
			}
			if (filters.type) {
				args.push(filters.type);
			}
			if (filters.tagIDs && filters.tagIDs.length > 0) {
				args.push(...filters.tagIDs);
			}
			if (filters.searchTerm) {
				const searchPattern = `%${filters.searchTerm}%`
				args.push(searchPattern, searchPattern,)
			}

			args.push(limit, offset);
			return args;
		}
	},

	// contar exercises
	count: {
		sql: (filters: ExerciseFilters) => {
			let sql = 'SELECT COUNT(DISTINCT e.id) as total FROM exercises e';

			if (filters.tagIDs && filters.tagIDs.length > 0) {
				sql += ' INNER JOIN exercise_tags et ON e.id = et.exercise_id';
			}

			sql += ` WHERE 1=1`;

			if (filters.difficulty) {
				sql += ' AND e.difficulty = ?';
			}

			if (filters.muscleGroup) {
				sql += ' AND e.muscle_group = ?';
			}

			if (filters.type) {
				sql += ' AND e.type = ?';
			}

			if (filters.tagIDs && filters.tagIDs.length > 0) {
				sql += ` AND et.tag_id IN (${filters.tagIDs.map(() => '?').join(',')})`;
			}

			if (filters.searchTerm) {
				sql += ' AND (e.name LIKE ? OR e.description LIKE ?)'
			}

			return sql;
		},
		args: (filters: ExerciseFilters) => {
			const args: any[] = [];

			if (filters.difficulty) {
				args.push(filters.difficulty);
			}
			if (filters.muscleGroup) {
				args.push(filters.muscleGroup);
			}
			if (filters.type) {
				args.push(filters.type);
			}
			if (filters.tagIDs && filters.tagIDs.length > 0) {
				args.push(...filters.tagIDs);
			}
			if (filters.searchTerm) {
				const searchPattern = `%${filters.searchTerm}%`
				args.push(searchPattern, searchPattern,)
			}

			return args;
		}
	},

	// Actualizar exercise
	updateExercise: {
		sql: (fields: string[]) => `
			UPDATE exercises
			SET ${fields.map((f) => `${f} = ?`).join(', ')}
			WHERE id = ?
			RETURNING *
		`,
		args: (id: string, data: Omit<ExerciseUpdateData, 'tagIds'>) => {
			const values = Object.entries(data)
				.filter(([ key ]) => key !== 'tagIds')
				.map(([ key, value ]) => {
					// convertir camelCase a snake_case
					if (key === 'muscleGroup') return value || null;
					return value || null;
				});
				
			return [ ...values, id ]
		}
	},

	// eliminar tag de un exercise 
	deleteExerciseTag: {
		sql: 'DELETE FROM exercise_tags WHERE exercise_id = ?',
		args: (exerciseId: string) => [ exerciseId ]
	},

	// Eliminar exercise
	deleteExercise: {
		sql: 'DELETE FROM exercises WHERE id = ?',
		args: (id: string) => [ id ],
	},

	// Verificar si exercise está en uso 
	isExerciseInUse: {
		sql: 'SELECT COUNT(*) as count FROM workout_exercises WHERE exercise_id = ?',
		args: (exerciseId: string) => [ exerciseId ]
	}
}

// ============================================
// TAG QUERIES
// ============================================

const tagQueries = {
	create: {
		sql: 'INSERT INTO tags (id, name) VALUES (?, ?) RETURNING *',
		args: (id: string, name: string) => [ id, name ],
	},

	findById: {
		sql: 'SELECT * FROM tags WHERE id = ?',
		args: (id: string) => [ id ],
	},

	findByName: {
		sql: 'SELECT * FROM tags WHERE LOWER(name) = LOWER(?)',
		args: (name: string) => [ name ],
	},

	findAll: {
		sql: 'SELECT * FROM tags ORDER BY name ASC',
		args: () => [],
	},

	delete: {
		sql: 'DELETE FROM tags WHERE id = ?',
		args: (id: string) => [ id ],
	},

	isTagInUse: {
		sql: 'SELECT COUNT(*) as count FROM exercise_tags WHERE tag_id = ?',
		args: (tagId: string) => [ tagId ],
	},
};

// ============================================
// EXERCISE REPOSITORY
// ============================================

export const exerciseRepository = {

	/**
	* Crear exercise con tags
	*/
	create: async (data: ExerciseCreateData): Promise<ExerciseWithTags> => {
		const exerciseId = uuidv4();

		// 1. Crear exercise
		const exerciseResult = await executeWithRetry((client) =>
			client.execute({
				sql: queries.createExercise.sql,
				args: queries.createExercise.args(
					exerciseId,
					data.name,
					data.description || null,
					data.difficulty || null,
					data.muscleGroup || null,
					data.type || null
				),
			})
		);

		if (exerciseResult.rows.length === 0) {
			throw new Error('Failed to create exercise');
		}

		const exercise = mapRowToExercise(exerciseResult.rows[ 0 ] as unknown as ExerciseRow);

		// 2. Crear relaciones con tags si hay
		if (data.tagIds && data.tagIds.length > 0) {
			const tagQueries = data.tagIds.map((tagId) => ({
				sql: queries.createExerciseTag.sql,
				args: queries.createExerciseTag.args(exerciseId, tagId),
			}));

			await batch(tagQueries);
		}

		// 3. Obtener tags
		const tags = data.tagIds ? await exerciseRepository.getTags(exerciseId) : [];

		return {
			...exercise,
			tags,
		};
	},



	/**
	 * Buscar exercise por ID con tags
	 * @param exerciseId id del exercise
	 * @returns exercise completo con tags
	 */
	findById: async (exerciseId: string): Promise<ExerciseWithTags | null> => {
		const result = await execute({
			sql: queries.findById.sql,
			args: queries.findById.args(exerciseId)
		})

		if (result.rows.length === 0) return null;

		const exercise = mapRowToExercise(result.rows[ 0 ] as unknown as ExerciseRow);

		// obtener tags
		const tags = await exerciseRepository.getTags(exerciseId);

		return {
			...exercise,
			tags
		}
	},

	/**
	 * Buscar exercise por nombre
	 * @param name del exercise
	 * @returns exercise 
	 */
	findByName: async (name: string): Promise<Exercise | null> => {
		const result = await execute({
			sql: queries.findByName.sql,
			args: queries.findByName.args(name)
		})

		if (result.rows.length === 0) return null;

		const exercise = mapRowToExercise(result.rows[ 0 ] as unknown as ExerciseRow);
		return exercise;
	},

	/**
	 * Obtener tags de un exercise
	 * @param exerciseId id del exercise
	 * @returns tags del exercise
	 */
	getTags: async (exerciseId: string): Promise<Tag[]> => {
		const result = await execute({
			sql: queries.findExerciseTags.sql,
			args: queries.findExerciseTags.args(exerciseId)
		})

		return result.rows.map(r => mapRowToTag(r as unknown as TagRow));
	},

	/**
	 * Listar exercises con filtros
	 * @param filters filtros para buscar exercises (difficulty, muscleGroup, type, tagIDs, searchTerm)
	 * @param page página actual
	 * @param limit número de resultados por página
	 * @returns lista de exercises con tags
	 */
	findAll: async (
		filters: ExerciseFilters,
		page: number = 1,
		limit: number = 10
	): Promise<ExerciseWithTags[]> => {

		const offset = (page - 1) * limit;

		const result = await execute({
			sql: queries.findAll.sql(filters),
			args: queries.findAll.args(filters, limit, offset)
		})

		if (result.rows.length === 0) return [];

		// obtener cada exercise con sus tags
		const exercisesWithTags = await Promise.all(
			result.rows.map(async (r) => {
				const exercise = mapRowToExercise(r as unknown as ExerciseRow);
				const tags = await exerciseRepository.getTags(exercise.id);
				return { ...exercise, tags };
			})
		)
		return exercisesWithTags;
	},

	/**
	 * Contar exercises
	 * @param filters filtros para buscar exercises (difficulty, muscleGroup, type, tagIDs, searchTerm)
	 * @returns número de exercises
	 */
	count: async (filters: ExerciseFilters): Promise<number> => {
		const result = await execute({
			sql: queries.count.sql(filters),
			args: queries.count.args(filters)
		});

		if (!result.rows[ 0 ]) {
			throw new Error('Count query returned empty result');
		}

		const { total } = result.rows[ 0 ] as unknown as { total: number };

		if (typeof total !== 'number' || total < 0) {
			throw new Error('Invalid count value: ' + total);
		}

		return total;
	},

	/**
	 * Actualizar exercise
	 * @param exerciseId id del exercise
	 * @data datos del exercise a actualizar (name, description, difficulty, muscleGroup, type, tagIds)
	 * @returns exercise completo con tags
	 */
	update: async (exerciseId: string, data: ExerciseUpdateData): Promise<ExerciseWithTags> => {
		
		// Actualizar datos básicos (sin tags)
		const updateData: any = {};
		if (data.name) updateData.name = data.name;
		if(data.description !== undefined) updateData.description = data.description || null;
		if(data.difficulty !== undefined) updateData.difficulty = data.difficulty || null;
		if(data.muscleGroup !== undefined) updateData.muscle_group = data.muscleGroup || null;
		if(data.type !== undefined) updateData.type = data.type || null;

		const fields = Object.keys(updateData);

		if(fields.length > 0) {
			await executeWithRetry((client)=>
				client.execute({
					sql: queries.updateExercise.sql(fields),
					args: queries.updateExercise.args(exerciseId, updateData)
				})
			)
		}

		// Actualizar tags si se proporcionan
		if(data.tagIds !== undefined){
			// Eliminar tags existentes
			await executeWithRetry((client) =>
				client.execute({
					sql:queries.deleteExerciseTag.sql,
					args: queries.deleteExerciseTag.args(exerciseId)
				})
			);

			// Crear nuevos tags
			if (data.tagIds.length > 0){
				const tagQueries= data.tagIds.map((tagId) =>({
					sql: queries.createExerciseTag.sql,
					args: queries.createExerciseTag.args(exerciseId, tagId)
				}));

				await batch(tagQueries);
			}
		}

		// Retornar exercise actualizado
		const updatedExercise = await exerciseRepository.findById(exerciseId);

		if(!updatedExercise){
			throw new Error('Exercise not found after update');
		}

		return updatedExercise;
	},

	/**
	* Eliminar exercise
	*/
	delete: async (id: string): Promise<void> => {
		await executeWithRetry((client) =>
			client.execute({
				sql: queries.deleteExercise.sql,
				args: queries.deleteExercise.args(id),
			})
		);
	},

	/**
	 * Verificar si exercise esta en uso
	 * @param exerciseId id del exercise
	 * @returns true si esta en uso, false si no
	 */
	isInUse: async (exerciseId: string): Promise<boolean> =>{
		const result= await execute({
			sql: queries.isExerciseInUse.sql,
			args: queries.isExerciseInUse.args(exerciseId)
		});
		
		const{count} = result.rows[0] as unknown as {count:number};;
		return count > 0
	},

	/**
	 * Verificar si existe por nombre
	 * @param name nombre del exercise
	 * @returns true si existe, false si no
	 */
	existsByName: async(name:string): Promise<boolean> =>{
		const exercise = await exerciseRepository.findByName(name);
		return exercise !== null;
	}
}

// ============================================
// TAG REPOSITORY
// ============================================

export const tagRepository = {
	/**
	 * Crear tag
	 * @param name nombre del tag
	 * @returns tag
	 */
	create: async (name:string):Promise<Tag> =>{
		const id = uuidv4();

		const result = await executeWithRetry((client) =>
			client.execute({
				sql:tagQueries.create.sql,
				args: tagQueries.create.args(id, name)
			})			
		);

		if(result.rows.length === 0 ){
			throw new Error('Failed to create tag')
		}

		return mapRowToTag(result.rows[0] as unknown as TagRow);
	}
}