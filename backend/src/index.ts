import express from "express";
import dotenv from "dotenv";
import { turso } from "@/config/database";
import cors from "cors";
import {log_error, log_info} from "@/utils/logger";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

async function testDatabaseConnection() {
	try {
		const result = await turso.execute({
			sql: "select * from exercises",

		})
		log_info("Database connection successful. Sample data:", result.rows);

	}catch(error){
		log_error("Database connection failed:", error);
		process.exit(1);
	}
}

testDatabaseConnection();

app.listen(PORT, () => {
	log_info(`Server is running on http://localhost:${PORT}`);
});
