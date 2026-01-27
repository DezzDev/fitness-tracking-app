// src/repositories/personalRecord.repository.ts
import { execute } from '@/config/database'
import {
	PersonalRecordCreateData,
	PersonalRecordFilters,
	PersonalRecordUpdateData,
	PersonalRecordWithExercise,
	PersonalRecordWithExerciseRow
} from '@/types'
import { v4 as uuidv4 } from 'uuid'



//===========================================
// Mappers
//===========================================



const mapRowToPersonalRecordWithExercise = (row: PersonalRecordWithExerciseRow): PersonalRecordWithExercise => ({
	id: row.id,
	userId: row.user_id,
	exerciseId: row.exercise_id,
	maxReps: row.max_reps ?? undefined,
	maxDurationSeconds: row.max_duration_seconds ?? undefined,
	maxWeight: row.max_weight ?? undefined,
	achievedAt: row.achieved_at,
	exerciseName: row.exercise_name,
	exerciseDescription: row.exercise_description ?? undefined,
	difficulty: row.difficulty ?? undefined,
	muscleGroup: row.muscle_group ?? undefined,
	type: row.type ?? undefined,
})

//===========================================
// Queries
//===========================================

const queries = {
	// Crear PR
	create: {
		sql: `
			INSERT INTO personal_records
				(id, user_id, exercise_id, max_reps, max_duration_seconds, max_weight, achieved_at)
			VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
			RETURNING *
		`,
		args: (
			id: string,
			userId: string,
			exerciseId: string,
			maxReps: number | null,
			maxDurationSeconds: number | null,
			maxWeight: number | null
		) => [ id, userId, exerciseId, maxReps, maxDurationSeconds, maxWeight ],
	},

	// Buscar PR por prId y userId, devuelve pr with exercise
	findById: {
		sql: `
			SELECT pr.*,
					e.name as exercise_name,
					e.description as exercise_description,
					e.difficulty,
					e.muscle_group,
					e.type as type
			FROM personal_records pr
			INNER JOIN exercises e ON pr.exercise_id = e.id
			WHERE pr.id = ? AND pr.user_id = ?
			
		`,
		args: (id: string, userId: string) => [ id, userId ],
	},

	// Buscar PR por userId y exerciseId, devuelve pr with exercise
	findByUserAndExercise: {
		sql: `
			SELECT pr.*,
					e.name as exercise_name,
					e.description as exercise_description,
					e.difficulty,
					e.muscle_group,
					e.type as type
			FROM personal_records pr
			INNER JOIN exercises e ON pr.exercise_id = e.id
			WHERE pr.user_id = ? AND pr.exercise_id = ?
		`,
		args: (userId: string, exerciseId: string) => [ userId, exerciseId ],
	},

	// Listar PRs con filtros
	findAll: {
		sql: (filters: PersonalRecordFilters) => {
			let sql = `
				SELECT pr.*,
						e.name as exercise_name,
						e.description as exercise_description,
						e.difficulty,
						e.muscle_group,
						e.type as type
				FROM personal_records pr
				INNER JOIN exercises e ON pr.exercise_id = e.id
				WHERE pr.user_id = ?
			`;

			if (filters.exerciseId) {
				sql += ' AND pr.exercise_id = ?';
			}
			if (filters.muscleGroup) {
				sql += ' AND e.muscle_group = ?';
			}
			if (filters.difficulty) {
				sql += ' AND e.difficulty = ?';
			}
			if (filters.type) {
				sql += ' AND e.type = ?';
			}

			sql += ' ORDER BY pr.achieved at DESC LIMIT ? OFFSET ?'

			return sql;
		},
		args: (filters: PersonalRecordFilters, limit: number, offset: number) => {
			const args: any[] = [ filters.userId ];

			if (filters.exerciseId) args.push(filters.exerciseId);
			if (filters.muscleGroup) args.push(filters.muscleGroup);
			if (filters.difficulty) args.push(filters.difficulty);
			if (filters.type) args.push(filters.type);

			args.push(limit, offset);

			return args;
		}
	},

	// Contar PRs con filtros
	count: {
		sql: (filters: PersonalRecordFilters) => {
			let sql = `
				SELECT COUNT(*) as total
				FROM personal_records pr
				INNER JOIN exercises e ON pr.exercise_id = e.id
				WHERE pr.user_id = ?
			`
			if (filters.exerciseId) sql += ' AND pr.exercise_id = ?';
			if (filters.muscleGroup) sql += ' AND e.muscle_group = ?';
			if (filters.difficulty) sql += ' AND e.difficulty = ?';
			if (filters.type) sql += ' AND e.type = ?';

			return sql;
		},
		args: (filters: PersonalRecordFilters) => {
			const args: any[] = [ filters.userId ];

			if (filters.exerciseId) args.push(filters.exerciseId);
			if (filters.muscleGroup) args.push(filters.muscleGroup);
			if (filters.difficulty) args.push(filters.difficulty);
			if (filters.type) args.push(filters.type);

			return args;
		}
	},

	// Actualizar PR
	update: {
		sql: (fields: string[]) => `
			UPDATE personal_records
			SET ${fields.map((f) => `${f} = ?`).join(', ')}, achieved_at = datetime('now')
			WHERE id = ? AND user_id = ?
			RETURNING *
		`,
		args: (id: string, userId: string, data: PersonalRecordUpdateData) => {
			const values = Object.entries(data).map(([ key, value ]) => {
				// Convertir valores a null si no se especifican
				if (key === 'maxReps') return value || null;
				if (key === 'maxDurationSeconds') return value || null;
				if (key === 'maxWeight') return value || null;
				return value || null;
			})
			return [ ...values, id, userId ];
		}
	},

	// Eliminar PR
	delete: {
		sql: 'DELETE FROM personal_records WHERE id = ? AND user_id = ?',
		args: (id: string, userId: string) => [ id, userId ],
	},

	// Obtener PRs recientes
	findRecent: {
		sql: `
			SELECT pr.*,
				e.name as exercise_name,
				e.description as exercise_description,
				e.difficulty,
				e.muscle_group,
				e.type as type
			FROM personal_records pr
			INNER JOIN exercises e ON pr.exercise_id = e.id
			WHERE pr.user_id = ?
			ORDER BY pr.achieved_at DESC
			LIMIT ?
		`,
		args: (userId: string, limit: number) => [ userId, limit ],
	}
}

//===========================================
// Repository
//===========================================

export const personalRecordRepository = {
	/**
	 * Crear personal record
	 * @param data datos del personal record a crear (userId, ejercicioId, maxReps, maxDurationSeconds, maxWeight)
	 * @returns personal record completo con ejercicio
	 */
	create: async (data: PersonalRecordCreateData): Promise<PersonalRecordWithExercise> => {
		const id = uuidv4();

		const result = await execute({
			sql: queries.create.sql,
			args: queries.create.args(
				id,
				data.userId,
				data.exerciseId,
				data.maxReps ?? null,
				data.maxDurationSeconds ?? null,
				data.maxWeight ?? null
			)
		})

		if (result.rows.length === 0) {
			throw new Error('Failed to create personal record');
		}

		// Obtener PR con info del ejercicio
		const pr = await personalRecordRepository.findById(id, data.userId)

		if (!pr) {
			throw new Error('Failed to retrieve created personal record');
		}

		return pr;
	},

	/**
	 * Buscar PR por ID y usuario
	 * @param id id del personal record
	 * @param userId id del usuario
	 * @returns personal record con ejercicio
	 */
	findById: async (
		id: string,
		userId: string
	): Promise<PersonalRecordWithExercise | null> => {
		const result = await execute({
			sql: queries.findById.sql,
			args: queries.findById.args(id, userId),
		});

		if (result.rows.length === 0) return null;

		return mapRowToPersonalRecordWithExercise(
			result.rows[ 0 ] as unknown as PersonalRecordWithExerciseRow
		);
	},

	/**
	 * Buscar Pr por userId y exerciseId, devuelve pr con ejercicio
	 * @param userId id del usuario
	 * @param exerciseId id del ejercicio
	 * @returns personal record con ejercicio
	 */
	findByUserAndExercise: async (
		userId: string,
		exerciseId: string
	): Promise<PersonalRecordWithExercise | null> => {
		const result = await execute({
			sql: queries.findByUserAndExercise.sql,
			args: queries.findByUserAndExercise.args(userId, exerciseId),
		});

		if (result.rows.length === 0) return null;

		return mapRowToPersonalRecordWithExercise(
			result.rows[ 0 ] as unknown as PersonalRecordWithExerciseRow
		);
	},

	/**
	 * Listar PRs con filtro
	 * @param filters filtros para buscar personal records (userId?, exerciseId?, muscleGroup?, difficulty?, type?)
	 * @param page página actual
	 * @param limit número de resultados por página
	 * @returns lista de personal records con ejercicio
	 */

	findAll: async (
		filters: PersonalRecordFilters,
		page: number = 1,
		limit: number = 10
	): Promise<PersonalRecordWithExercise[]> => {
		const offset = (page -1 ) * limit;

		const result = await execute({
			sql:queries.findAll.sql(filters),
			args: queries.findAll.args(filters, limit, offset)
		})
		return result.rows.map(row => 
			mapRowToPersonalRecordWithExercise(row as unknown as PersonalRecordWithExerciseRow)
		)
	},

	/**
	 * Contar PRs con filtros
	 * @param filters filtros para buscar personal records (userId, ejercicioId, muscleGroup, difficulty, type)
	 * @returns número de personal records
	 */
	count : async (filters:PersonalRecordFilters): Promise<number> =>{
		const result = await execute({
			sql: queries.count.sql(filters),
			args: queries.count.args(filters)
		})

		if(!result.rows?.[0]){
			throw new Error ('Count query returned empty result');
		}

		const {total} = result.rows[0] as unknown as {total:number};

		if(typeof total !== 'number' || total < 0){
			throw new Error('Invalid count value: ' + total);
		}
		return total;
	},

	/**
	 * Actualizar PR
	 * @param id id del personal record
	 * @param userId id del usuario
	 * @param data datos del personal record a actualizar (maxReps, maxDurationSeconds, maxWeight)
	 * @returns personal record con ejercicio
	 */
	update: async (
		id: string,
		userId: string,
		data: PersonalRecordUpdateData
	):Promise<PersonalRecordWithExercise> => {
		const updateData : any = {};
		// Convert camelCase to snake_case
		if (data.maxReps !== undefined) updateData.max_reps = data.maxReps ?? null;
		if (data.maxDurationSeconds !== undefined) updateData.max_duration_seconds = data.maxDurationSeconds ?? null;
		if (data.maxWeight !== undefined) updateData.max_weight = data.maxWeight ?? null;

		const fields = Object.keys(updateData);

		if(fields.length === 0){
			throw new Error
		}

		await execute({
			sql: queries.update.sql(fields),
			args: queries.update.args(id, userId, updateData)
		})

		const updatePR = await personalRecordRepository.findById(id, userId);

		if (!updatePR) {
			throw new Error('Personal record not found after update');
		}
		return updatePR;
	},

	/**
	 * Eliminar PR
	 * @param id id del personal record
	 * @param userId id del usuario
	 * @returns void
	 */
	delete: async (id: string, userId: string): Promise<void> => {
		await execute({
			sql: queries.delete.sql,
			args: queries.delete.args(id, userId)
		})
	},

	/**
		* Obtener récords recientes
		* @param userId id del usuario
		* @param limit número de resultados a devolver
		* @returns lista de personal records con ejercicio
		*/
	findRecent: async (
		userId: string,
		limit: number = 5
	): Promise<PersonalRecordWithExercise[]> => {
		const result = await execute({
			sql: queries.findRecent.sql,
			args: queries.findRecent.args(userId, limit),
		});

		return result.rows.map((row) =>
			mapRowToPersonalRecordWithExercise(row as unknown as PersonalRecordWithExerciseRow)
		);
	},

	/**
	* Verificar si PR pertenece a usuario
	* @param recordId id del personal record
	* @param userId id del usuario
	* @returns true si pertenece, false si no
	*/
	belongsToUser: async (recordId: string, userId: string): Promise<boolean> => {
		const pr = await personalRecordRepository.findById(recordId, userId);
		return pr !== null;
	},
}
