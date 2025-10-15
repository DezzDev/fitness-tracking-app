// src/index.ts
import express from "express";

import { connectDatabase } from "@/config/database";
import cors from "cors";
import logger from "@/utils/logger";
import { env } from "@/config/env";


const app = express();

// Servir archivos estáticos
// Esto hará que tu imagen sea accesible en:
// 👉 http://localhost:3000/public/images/default-avatar.png
app.use('/public', express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

async function startServer() {

	// Conectar a la base de datos
	await connectDatabase();


}

startServer();

app.listen(env.PORT, () => {
	logger.info(`Server is running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
});



