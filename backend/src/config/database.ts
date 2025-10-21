// src/config/database.ts
import { createClient, Client, ResultSet, InArgs } from "@libsql/client";
import { env } from "@/config/env";
import logger from "@/utils/logger";



// ============================================
// TIPOS
// ============================================

interface ConnectionState  {
  client: Client;
  isConnected: boolean;
  lastCheck: Date;
};

// ============================================
// CONSTANTES
// ============================================

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const CONNECTION_CHECK_INTERVAL = 30000; // 30s

// ============================================
// ESTADO (Inmutable desde fuera)
// ============================================

let state: ConnectionState | null = null;



// ============================================
// FUNCIONES PURAS
// ============================================

const createDatabaseClient = (): Client =>
  createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  });

const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

const testConnection = async (client: Client): Promise<boolean> => {
  try {
    await client.execute('SELECT 1');
    return true;
  } catch {
    return false;
  }
};

// ============================================
// FUNCIONES DE CONEXIÓN
// ============================================

export const connectDatabase = async (retries = MAX_RETRIES): Promise<Client> => {
  // Si ya existe conexión válida, retornarla
  if (state?.isConnected) {
    return state.client;
  }

  const client = state?.client ?? createDatabaseClient();

  for (let attempt = 1; attempt <= retries; attempt++) {
    const isConnected = await testConnection(client);

    if (isConnected) {
      state = {
        client,
        isConnected: true,
        lastCheck: new Date(),
      };
      
      logger.info('✅ Database connected successfully');
      return client;
    }

    logger.warn(`Database connection attempt ${attempt}/${retries} failed`);

    if (attempt < retries) {
      await delay(RETRY_DELAY_MS * attempt);
    }
  }

  throw new Error('Failed to connect to database after all retries');
};

export const disconnectDatabase = (): void => {
  if (state?.client) {
    state.client.close();
    state = null;
    logger.info('Database disconnected');
  }
};

export const getClient = (): Client => {
  if (!state?.client) {
    throw new Error('Database not initialized. Call connectDatabase() first');
  }
  return state.client;
};

export const isDatabaseConnected = (): boolean => 
  state?.isConnected ?? false;


// ============================================
// HEALTH CHECK PERIÓDICO (opcional)
// ============================================

export const startHealthCheck = (): NodeJS.Timeout => {
  return setInterval(async () => {
    if (!state) return;

    const isHealthy = await testConnection(state.client);
    
    if (!isHealthy && state.isConnected) {
      logger.error('Database health check failed');
      state = { ...state, isConnected: false };
    } else if (isHealthy && !state.isConnected) {
      logger.info('Database connection recovered');
      state = { ...state, isConnected: true };
    }

    state = { ...state, lastCheck: new Date() };
  }, CONNECTION_CHECK_INTERVAL);
};

// ============================================
// HELPERS: Query con retry
// ============================================

export const executeWithRetry = async <T>(
	queryFn: (client: Client) => Promise<T>, // 👈 recibe una función que usa un cliente
  retries = 2
): Promise<T> => {
  const client = getClient();

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
			// 👇 ejecuta tu función, pasándole el cliente
      return await queryFn(client);
    } catch (error) {
      if (attempt > retries) throw error;
      
      logger.warn(`Query retry ${attempt}/${retries}`, { 
        error: error instanceof Error ? error.message : 'Unknown'
      });
      
      await delay(500 * attempt);
    }
  }

  throw new Error(`Query failed after retries`);
};

// ============================================
// QUERIES HELPER (más funcional)
// ============================================

interface QueryParams {
  sql: string;
  args?:InArgs | undefined;
};

export const execute = (params: QueryParams): Promise<ResultSet> =>
  executeWithRetry(client => client.execute(params));

export const batch = (queries: QueryParams[]): Promise<ResultSet[]> =>
  executeWithRetry(client => client.batch(queries));

 // Usar
  // const result = await execute({
  //   sql: 'SELECT * FROM users WHERE id = ?',
  //   args: [123]
  // });