// src/index.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connectDatabase, disconnectDatabase } from "@/config/database";
import { env, isDevelopment } from "@/config/env";
import logger from "@/utils/logger";
import { errorHandler, notFoundHandler } from "@/middlewares/error.middleware";
import { startCleanupJobs } from "./jobs/cleanup.job";

// ============================================
// IMPORTAR RUTAS
// ============================================
import userRoutes from "@/routes/user.routes";
import exerciseRoutes from "@/routes/exercise.routes";
import tagRoutes from "@/routes/tag.routes";
import personalRecordRoutes from "@/routes/personalRecord.routes";
import workoutTemplatesRoutes from "@/routes/workoutTemplate.routes";
import workoutSessionRoutes from "@/routes/workoutSession.routes";
import authRoutes from "@/routes/auth.routes";

// ============================================
// CONFIGURACIÓN
// ============================================

const app = express();
// Servir archivos estáticos
// Esto hará que tu imagen sea accesible en:
// 👉 http://localhost:3000/public/images/default-avatar.png
app.use('/public', express.static('public'));

// Middlewares globales
// Middleware de logging
app.use((req, _res, next) => {
	logger.info(`🟢 Request recibido: method: ${req.method}; url: ${req.url}`);
	next();
});

// Request logging (desarrollo)
if (isDevelopment) {
	app.use((req, _res, next) => {
		logger.debug(`${req.method} ${req.path}`, { body: req.body, query: req.query });
		next();
	});
}


app.use(helmet());
app.use(cors({
	origin: isDevelopment ? 'http://localhost:5173' : process.env.ALLOWED_ORIGINS?.split(','),
	credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (_req, res) => {
	res.json({
		status: 'ok',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		environment: env.NODE_ENV,
	});
});

// ============================================
// API ROUTES
// ============================================

app.use('/api/users', userRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/personal-records', personalRecordRoutes);
app.use('/api/workoutTemplates', workoutTemplatesRoutes);
app.use('/api/workoutSessions', workoutSessionRoutes);
app.use('/api/auth', authRoutes);

// ============================================
// ERROR HANDLERS
// ============================================

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// SERVIDOR
// ============================================

async function startServer() {
	try {
		
		await connectDatabase().then(
      () => startCleanupJobs()
    );

		const server = app.listen(env.PORT, () => {
			logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
			logger.info(`📝 Environment: ${env.NODE_ENV}`);
			logger.info(`📊 Log level: ${env.LOG_LEVEL}`);
		});

		const gracefulShutdown = async (signal: string) => {
			logger.info(`${signal} received, shutting down gracefully...`);

			server.close(async () => {
				logger.info('HTTP server closed');
				await disconnectDatabase();
				logger.info('Database disconnected');
				process.exit(0);
			});

			setTimeout(() => {
				logger.error('Forced shutdown after timeout');
				process.exit(1);
			}, 10000);
		};

		process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
		process.on('SIGINT', () => gracefulShutdown('SIGINT'));

	} catch (error) {
		logger.error('Failed to start server:', error);
		process.exit(1);
	}
}

process.on('unhandledRejection', (reason: unknown) => {
	logger.error('Unhandled Rejection:', reason);
	process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
	logger.error('Uncaught Exception:', error);
	process.exit(1);
});

startServer();




