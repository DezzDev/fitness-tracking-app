// src/test-utils/setup.ts
import { disconnectDatabase } from "@/config/database";
import { afterAll, beforeAll, jest } from "@jest/globals";
import { afterEach } from "node:test";

// ejecutar antes de todos los tests
beforeAll(async () =>{
	process.env.NODE_ENV = 'test';
	process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
	process.env.LOG_LEVEL = 'error'; // Silenciar logs en tests
});

// ejecutar después de todos los test
afterAll(async () =>{
	// cerrar conexión a DB
	await disconnectDatabase()
})

// limpiar después de cada test
afterEach(()=>{
	jest.clearAllMocks()
})
