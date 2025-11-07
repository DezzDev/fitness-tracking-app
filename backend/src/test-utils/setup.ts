// src/test-utils/setup.ts
import { disconnectDatabase } from "@/config/database";
import { afterAll, beforeAll,afterEach, jest } from "@jest/globals";

// ejecutar antes de todos los tests
beforeAll(async () =>{
	process.env.NODE_ENV = 'test';
	process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
	process.env.LOG_LEVEL = 'error'; // Silenciar logs en tests
});

// limpiar después de cada test
afterEach(()=>{
	jest.clearAllMocks()
})


// ejecutar después de todos los test
afterAll(async () =>{
	// cerrar conexión a DB
	await disconnectDatabase()
})
