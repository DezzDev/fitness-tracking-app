import express from "express";
import dotenv from "dotenv";
import { turso } from "@/config/database";
import cors from "cors";


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
		console.log(result)

	}catch(error){
		console.error("Database connection failed:", error);
		process.exit(1);
	}
}

testDatabaseConnection();

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
