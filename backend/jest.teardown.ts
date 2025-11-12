// ============================================
// jest.teardown.ts
// ============================================
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config({})



export default async function globalTeardown() {
	const db = createClient({
		url: process.env.TURSO_DATABASE_URL!,
		authToken: process.env.TURSO_AUTH_TOKEN!,
	});

	try {
		console.log('🧹 Limpiando usuarios de test...');

		await db.execute(`
      DELETE FROM users 
      WHERE email LIKE 'mocked-%' 
         OR (email LIKE 'mocked-%' AND is_active = 0);
    `);

		console.log('✅ Limpieza completada con éxito.');
	} catch (err) {
		console.error('❌ Error durante la limpieza global:', err);
	} finally {
		await db.close();
	}
}
