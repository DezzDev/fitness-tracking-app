// src/repositories/exercise.repository.ts
import {execute, executeWithRetry, batch } from '@/config/database'
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
import {v4 as uuidv4} from 'uuid';

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

const mapRowToTag = (row: TagRow):Tag =>({
	id: row.id,
	name: row.name,
})

// ============================================
// QUERIES 
// ============================================

const queries = {
	// Crear exercise
	createExercise : {
		sql: `
			INSERT INTO exercises (id, name, description, difficulty, muscle_group, type, created_at)
			VALUES (?, ?, ?, ?, ?, ?, datetime('now))
			RETURNING *
		`,
		args: (
			id:string,
			name: string,
			description: string | null,
			difficulty: string | null,
			muscle_group: string | null,
			type: string | null
		) => [id, name, description, difficulty, muscle_group, type]		
	},

	// Crear relación exercise-tag
	createExerciseTag:{
		sql: `
			INSERT INTO exercise_tags (exercise_id, tag_id)
			VALUES (?, ?)
		`,
		args: (exerciseId: string, tagId: string) => [exerciseId, tagId]
	},
	
	// Buscar exercise por ID
	findById: {
		sql: `SELECT * FROM exercises WHERE id = ?`,
		args: (id: string) => [id]
	},

	// Buscar exercise por Nombre
	findByName: {
		sql : `SELECT * FROM exercises WHERE LOWER(name) = LOWER(?)`,
		args: (name: string) => [name]
	},

	// Buscar tags de un exercise
	findExerciseTags: {
		sql: `
			SELECT t.* FROM tags t
			INNER JOIN exercise_tags et ON t.id = et.tag_id
			WHERE et.exercise_id = ?
			ORDER BY t.name ASC 
		`,
		args: (exerciseId: string) => [exerciseId]
	},

	// Listar exercises con filtros
	findAll:{
		sql: (filters: ExerciseFilters) => {
			let sql = 'SELECT DISTINCT e.* FROM exercises e';

			// Join con tags si se filtra por tag
			if(filters.tagIDs && filters.tagIDs.length > 0){
				sql +=' INNER JOIN exercise_tags et ON e.id = et.exercise_id';
			}

			sql += ` WHERE 1=1`;

			if(filters.difficulty){
				sql += ' AND e.difficulty = ?';
			}

			if(filters.muscleGroup){
				sql += ' AND e.muscle_group = ?';
			}

			if(filters.type){
				sql += ' AND e.type = ?';
			}

			if(filters.tagIDs && filters.tagIDs.length > 0){
				sql += ` AND et.tag_id IN (${filters.tagIDs.map(() => '?').join(',')})`;
			}

			if(filters.searchTerm){
				sql += ' AND (e.name LIKE ? OR e.description LIKE ?)'
			}

			sql += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';

			return sql;
		},
		args: (filters: ExerciseFilters, limit:number, offset: number)=>{
			const args: any[] =[];

			if(filters.difficulty){
				args.push(filters.difficulty);
			}
			if(filters.muscleGroup){
				args.push(filters.muscleGroup);
			}
			if(filters.type){
				args.push(filters.type);
			}
			if(filters.tagIDs && filters.tagIDs.length > 0){
				args.push(...filters.tagIDs);
			}	
			if(filters.searchTerm){
				const searchPattern = `%${filters.searchTerm}%`
				args.push(searchPattern, searchPattern,)
			}

			args.push(limit, offset);
			return args;
		}
	},

	// contar exercises
	count : {
		sql:(filters:ExerciseFilters)=>{
			let sql = 'SELECT COUNT(DISTINCT e.id) as total FROM exercises e';

			if(filters.tagIDs && filters.tagIDs.length > 0){
				sql += ' INNER JOIN exercise_tags et ON e.id = et.exercise_id';
			}

			sql += ` WHERE 1=1`;

			if(filters.difficulty){
				sql += ' AND e.difficulty = ?';
			}

			if(filters.muscleGroup){
				sql += ' AND e.muscle_group = ?';
			}

			if(filters.type){
				sql += ' AND e.type = ?';
			}

			if(filters.tagIDs && filters.tagIDs.length > 0){
				sql += ` AND et.tag_id IN (${filters.tagIDs.map(() => '?').join(',')})`;
			}

			if(filters.searchTerm){
				sql += ' AND (e.name LIKE ? OR e.description LIKE ?)'
			}

			return sql;
		},
		args: (filters: ExerciseFilters)=>{
			const args: any[] = [];

			if(filters.difficulty){
				args.push(filters.difficulty);
			}
			if(filters.muscleGroup){
				args.push(filters.muscleGroup);
			}
			if(filters.type){
				args.push(filters.type);
			}
			if(filters.tagIDs && filters.tagIDs.length > 0){
				args.push(...filters.tagIDs);
			}	
			if(filters.searchTerm){
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
		args:(id: string, data: ExerciseUpdateData) => {
			const values = Object.entries(data)
				.filter(([key])=> key !== 'tagIDs')
				.map(([key, value])=>{
					// convertir camelCase a snake_case
					if(key === 'muscleGroup') return value || null;
					return value || null;
				});
				return [...values, id]
		}
	},

	// eliminar tag de un exercise 
	deleteExerciseTag: {
		sql: 'DELETE FROM exercise_tags WHERE exercise_id = ?',
		args: (exerciseId: string) => [ exerciseId ]
	},

	// Verificar si exercise está en uso 
	isExerciseInUse: {
		sql: 'SELECT COUNT(*) as count FROM workout_exercises WHERE exercise_id = ?',
		args: (exerciseId: string) => [exerciseId]
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
