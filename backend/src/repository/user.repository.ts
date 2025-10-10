//import { Client } from "@libsql/client";
import { execute } from "@/config/database";
import { User, UserCreateData } from "@/types";


// ============================================
// REPOSITORY - Operaciones de datos puras
// ============================================



export const findById = async (id: string) => {
	return await execute({
		sql: 'SELECT * FROM users WHERE id = ?',
		args: [ id ]
	}).then(rows => rows.rowsAffected > 0 ? rows.rows[ 0 ] : null);
};

export const create = async (userData: UserCreateData) => {
	const { email, name, age, role } = userData;
	return await execute({
		sql:
	})

};