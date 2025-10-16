//import { Client } from "@libsql/client";
import { execute, executeWithRetry } from "@/config/database";
import { User, UserCreateData, UserUpdateData, UserRow } from "@/types";
import { v4 as uuidv4 } from 'uuid';



// ============================================
// REPOSITORY - Acceso a datos
// ============================================

// ============================================
// FUNCIONES PURAS: Mapeo DB ↔ Domain
// ============================================

const mapRowToUser = (row: UserRow): User => ({
	id: row.id,
	email: row.email,
	name: row.name,
	age: row.age,
	role: row.role,
	is_active: row.is_active,
	profile_image: row.profile_image,
	createdAt: new Date(row.created_at),
	updatedAt: new Date(row.updated_at),

});

// const mapUserToRow = (user: User): Omit<UserRow, 'created_at' | 'updated_at' | 'password_hash'> => ({
// 	id: user.id,
// 	email: user.email,
// 	name: user.name,
// 	age: user.age,
// 	role: user.role,
// 	is_active: user.is_active,
// 	profile_image: user.profile_image
// });

// ============================================
// QUERIES: Funciones puras que retornan SQL
// ============================================

const queries = {
	create: {
		sql: `
			INSERT INTO users (id, email, password_hash, name, age, role, profile_image, created_at, updated_at)
			VALUES (?,?,?,?,?,?,?,datetime('now'),datetime('now'))
			RETURNING *
		`,
		args: (id: string, data: UserCreateData, password_hash: string) => [
			id,
			data.email,
			password_hash,
			data.name,
			data.age,
			data.role,
			data.profile_image
		]
	},

	findById: {
		sql: `SELECT * FROM users WHERE id = ? AND is_active = 1`,
		args: (id: string) => [ id ]
	},

	findByEmail: {
		sql: 'SELECT * FROM users WHERE email = ? AND is_active = 1',
		args: (email: string) => [ email ]
	},

	findAll: {
		sql: `
			SELECT * FROM users
			ORDER BY created_at DESC
			LIMIT ? OFFSET ?
		`,
		args: (limit: number, offset: number) => [ limit, offset ]
	},

	count: {
		sql: `SELECT COUNT(*) as total FROM users`,
		args: () => []
	},

	update: {
		sql: (fields: string[]) => `
			UPDATE users
			SET ${fields.map(f => `${f} = ?`).join(', ')}, updated_at = datetime('now')
			WHERE id = ?
			RETURNING *
		`,
		args: (id: string, data: UserUpdateData) => {
			const values = Object.values(data);
			return [ ...values, id ];
		}
	},

	delete: {
		sql: 'DELETE FROM users WHERE id= ?',
		args: (id: string) => [ id ],
	},

	updatePassword: {
		sql: `
			UPDATE users 
			SET password_hash = ? 
			WHERE id = ? 
			RETURNING *
			`,
		args: (password_hash: string, id: string) => [ password_hash, id ]
	}

};

// ============================================
// REPOSITORY: Funciones de acceso a datos
// ============================================


export const userRepository = {

	/**
	 * Crear un nuevo usuario
	 */

	create: async (data: UserCreateData, passwordHash: string): Promise<User> => {
		const id = uuidv4();

		const result = await executeWithRetry(client => client.execute({
			sql: queries.create.sql,
			args: queries.create.args(id, data, passwordHash)
		}));

		if (result.rows.length === 0) {
			throw new Error('Failed to create user');
		}

		return mapRowToUser(result.rows[ 0 ] as unknown as UserRow);

	},

	/**
	 * Buscar usuario por ID
	 */
	findById: async (id: string): Promise<User | null> => {
		const result = await execute({
			sql: queries.findById.sql,
			args: queries.findById.args(id)
		});

		if (result.rows.length === 0) return null;

		return mapRowToUser(result.rows[ 0 ] as unknown as UserRow);
	},

	/**
	 * Buscar usuario por email
	 */
	findByEmail: async (email: string): Promise<User | null> => {
		const result = await execute({
			sql: queries.findByEmail.sql,
			args: queries.findByEmail.args(email),
		});

		if (result.rows.length === 0) return null;

		return mapRowToUser(result.rows[ 0 ] as unknown as UserRow);
	},

	/**
	 * Buscar usuario por email (con password)
	 */
	findByEmailWithPassword: async (
		email: string
	): Promise<(User & { passwordHash: string }) | null> => {
		const result = await execute({
			sql: queries.findByEmail.sql,
			args: queries.findByEmail.args(email)
		});

		if (result.rows.length === 0) return null;

		const row = result.rows[ 0 ] as unknown as UserRow;

		return {
			...mapRowToUser(row),
			passwordHash: row.password_hash
		};
	},

	/**
	* Listar todos los usuarios (paginado)
	*/
	findAll: async (page = 1, limit = 10): Promise<User[]> => {
		const offset = (page - 1) * limit;

		const result = await execute({
			sql: queries.findAll.sql,
			args: queries.findAll.args(limit, offset)
		});
		return result.rows.map(row => mapRowToUser(row as unknown as UserRow));
	},


	/**
	 * Contar total de usuarios
	 * *********************************PENDIENTE DE REVISIÓN 
	 */
	count: async (): Promise<number> => {
		const result = await execute({
			sql: queries.count.sql,
			args: queries.count.args()
		});
		return (result.rows[ 0 ] as unknown as { total: number }).total;
	},

	/**
	* Actualizar usuario
	*/
	update: async (id: string, data: UserUpdateData): Promise<User> => {
		const fields = Object.keys(data);

		if (fields.length === 0) {
			throw new Error('No fields to update');
		}

		const result = await executeWithRetry(client =>
			client.execute({
				sql: queries.update.sql(fields),
				args: queries.update.args(id, data)
			})
		);

		if (result.rows.length === 0) {
			throw new Error('User not found');
		}

		return mapRowToUser(result.rows[ 0 ] as unknown as UserRow);
	},

	/**
	 * Eliminar usuario
	 */
	delete: async (id: string): Promise<void> => {
		await executeWithRetry(client =>
			client.execute({
				sql: queries.delete.sql,
				args: queries.delete.args(id)
			})
		);
	},

	/**
	 * Verificar si existe un usuario por email
	 */
	existByEmail: async (email: string): Promise<boolean> => {
		const user = await userRepository.findByEmail(email);
		return user !== null;
	},

	/**
	 * Actualizar contraseña
	 */
	updatePassword: async (id: string, passwordHash: string): Promise<User> => {
		const result = await executeWithRetry(client =>
			client.execute({
				sql: queries.updatePassword.sql,
				args: queries.updatePassword.args(id, passwordHash)
			})
		);

		if (result.rows.length === 0) {
			throw new Error('User not found');
		}

		return mapRowToUser(result.rows[ 0 ] as unknown as UserRow);
	}
};