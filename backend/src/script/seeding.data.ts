import {v4 as uuidv4} from 'uuid';
import {executeWithRetry, connectDatabase} from '@/config/database';
import express from 'express';

// init express
const app = express();


// 1. Tags

// const tags = [
// 	"sin material",
// 	"barra fija",
// 	"anillas",
// 	"explosivo",
// 	"core",
// 	"piernas",
// 	"push",
// 	"pull",
// 	"equilibrio",
// 	"movilidad"
// ].map(name => ({
// 	id: uuidv4(),
// 	name
// }));

// 2. Exercises

const exercises = [
	{
		name: "Extensiones de tríceps en barra",
		description: "Extensión de brazos en barra baja tipo rompecráneos",
		difficulty: "beginner",
		muscle_group: "tríceps",
		type: "strength"
	},
	{
		name: "Pike push-ups",
		description: "Flexiones en V enfocadas en hombros",
		difficulty: "intermediate",
		muscle_group: "hombros",
		type: "strength"
	},
	{
		name: "Press militar",
		description: "Empuje vertical con barra o mancuernas",
		difficulty: "intermediate",
		muscle_group: "hombros",
		type: "strength"
	},
	{
		name: "Dominadas australianas",
		description: "Remo invertido en barra baja",
		difficulty: "beginner",
		muscle_group: "espalda",
		type: "strength"
	},
	{
		name: "Dominadas altas",
		description: "Dominadas llevando el pecho a la barra",
		difficulty: "advanced",
		muscle_group: "espalda",
		type: "strength"
	},
	{
		name: "Curl de bíceps",
		description: "Flexión de brazo con peso para bíceps",
		difficulty: "beginner",
		muscle_group: "bíceps",
		type: "strength"
	},
	{
		name: "Remo con mancuerna",
		description: "Remo unilateral con mancuerna",
		difficulty: "beginner",
		muscle_group: "espalda",
		type: "strength"
	},
	{
		name: "Elevaciones de pantorrilla",
		description: "Elevación de talones para gemelos",
		difficulty: "beginner",
		muscle_group: "piernas",
		type: "strength"
	}
].map(e => ({
	id: uuidv4(),
	...e
}));

// 3. ejercicio - tags
// map nombres -> IDs reales

// nombre de ejercicio -> id
// const mapExercise = (name:string) => 
// 	exercises.find(e => e.name === name)!.id;

// const mapTag = (name:string) =>
// 	tags.find(t => t.name === name)!.id;

// const exerciseTags = [
// 	// Flexiones → sin material + push
// 	{ exercise_id: mapExercise("Flexiones"), tag_id: mapTag("sin material") },
// 	{ exercise_id: mapExercise("Flexiones"), tag_id: mapTag("push") },

// 	// Dips → sin material + push
// 	{ exercise_id: mapExercise("Dips en paralelas"), tag_id: mapTag("sin material") },
// 	{ exercise_id: mapExercise("Dips en paralelas"), tag_id: mapTag("push") },

// 	// Dominadas pronas → barra fija + pull
// 	{ exercise_id: mapExercise("Dominadas pronas"), tag_id: mapTag("barra fija") },
// 	{ exercise_id: mapExercise("Dominadas pronas"), tag_id: mapTag("pull") },

// 	// Muscle-up → barra fija + pull + explosivo
// 	{ exercise_id: mapExercise("Muscle-up"), tag_id: mapTag("barra fija") },
// 	{ exercise_id: mapExercise("Muscle-up"), tag_id: mapTag("pull") },
// 	{ exercise_id: mapExercise("Muscle-up"), tag_id: mapTag("explosivo") },

// 	// Plancha frontal → core
// 	{ exercise_id: mapExercise("Plancha frontal"), tag_id: mapTag("core") },

// 	// Pistol squat → piernas + equilibrio
// 	{ exercise_id: mapExercise("Sentadilla pistol"), tag_id: mapTag("piernas") },
// 	{ exercise_id: mapExercise("Sentadilla pistol"), tag_id: mapTag("equilibrio") }
// ];

// seed main function

async function seed() {

	// console.log("seeding tags...")
	// for(const t of tags){
	// 	await executeWithRetry(client => 
	// 		client.execute({
	// 			sql: `INSERT INTO tags (id, name) VALUES (?,?)`,
	// 			args: [t.id, t.name]
	// 		})
	// 	)
	// }

	console.log("seeding exercises...")
	for (const e of exercises){
		await executeWithRetry(client =>
			client.execute({
				sql: `
					INSERT INTO exercises (id, name, description, difficulty, muscle_group, type)
					VALUES (?,?,?,?,?,?)
				`,
				args:[e.id, e.name, e.description, e.difficulty, e.muscle_group, e.type]
			})
		)
	}

	// console.log("seeding exercises tags...")
	// for(const et of exerciseTags){		
	// 	await executeWithRetry(client =>
	// 		client.execute({
	// 			sql:`
	// 				INSERT INTO exercise_tags (exercise_id, tag_id) VALUES (?,?)
	// 			`,
	// 			args: [et.exercise_id, et.tag_id]
	// 		})
	// 	)
	// }
	console.log("seed completo")
}

const start = async () => {
	// connect database
	await connectDatabase();

	app.listen(3000, () => {
		console.log('Server started on port 3000');
		
		seed().catch(err => {
			console.error("seed failed", err);
			process.exit(1)
		}).finally(()=>{
			process.exit(1);
		})
	});

}

start();
