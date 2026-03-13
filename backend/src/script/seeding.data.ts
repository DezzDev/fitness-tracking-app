import {v4 as uuidv4} from 'uuid';
import {executeWithRetry, connectDatabase} from '@/config/database';
import express from 'express';

// init express
const app = express();


// 1. Tags

const tags = [
	"sin material",
	"barra fija",
	"anillas",
	"explosivo",
	"core",
	"piernas",
	"push",
	"pull",
	"equilibrio",
	"movilidad"
].map(name => ({
	id: uuidv4(),
	name
}));

// 2. Exercises

const exercises = [
	// push
	{
		name: "Flexiones",
		description: "Clásicas flexiones de pecho",
		difficulty: "beginner",
		muscle_group: "pecho",
		type: "strength"
	},
	{
		name: "Flexiones diamante",
		description: "Flexiones con manos juntas para tríceps",
		difficulty: "intermediate",
		muscle_group: "pecho",
		type: "strength"
	},
	{
		name: "Flexiones pino asistidas",
		description: "Flexión en vertical asistida contra pared",
		difficulty: "intermediate",
		muscle_group: "hombros",
		type: "strength"
	},
	{
		name: "Flexiones pino libres",
		description: "Flexiones en pino sin apoyo",
		difficulty: "advanced",
		muscle_group: "hombros",
		type: "strength"
	},
	{
		name: "Dips en paralelas",
		description: "Fondos en barras paralelas",
		difficulty: "intermediate",
		muscle_group: "tríceps",
		type: "strength"
	},

	// PULL
	{
		name: "Dominadas pronas",
		description: "Dominadas agarre prono",
		difficulty: "beginner",
		muscle_group: "espalda",
		type: "strength"
	},
	{
		name: "Dominadas supinas",
		description: "Dominadas agarre supino",
		difficulty: "beginner",
		muscle_group: "espalda",
		type: "strength"
	},
	{
		name: "Dominadas explosivas",
		description: "Dominadas con impulso explosivo",
		difficulty: "advanced",
		muscle_group: "espalda",
		type: "explosive"
	},
	{
		name: "Muscle-up",
		description: "Transición de dominada a dip en barra",
		difficulty: "advanced",
		muscle_group: "full-body",
		type: "skill"
	},

	// CORE
	{
		name: "Plancha frontal",
		description: "Mantener cuerpo recto apoyado en antebrazos",
		difficulty: "beginner",
		muscle_group: "core",
		type: "endurance"
	},
	{
		name: "Plancha lateral",
		description: "Plancha apoyando un solo brazo",
		difficulty: "intermediate",
		muscle_group: "core",
		type: "endurance"
	},
	{
		name: "Dragon flag",
		description: "Ejercicio avanzado para abdomen y core",
		difficulty: "advanced",
		muscle_group: "core",
		type: "strength"
	},
	{
		name: "L-sit",
		description: "Mantener posición en L sobre paralelas o suelo",
		difficulty: "intermediate",
		muscle_group: "core",
		type: "skill"
	},
	{
		name: "V-ups",
		description: "Ejercicio abdominal subiendo piernas y tronco",
		difficulty: "intermediate",
		muscle_group: "core",
		type: "strength"
	},

	// PIERNAS
	{
		name: "Sentadillas",
		description: "Squats clásicas con peso corporal",
		difficulty: "beginner",
		muscle_group: "piernas",
		type: "strength"
	},
	{
		name: "Sentadilla pistol",
		description: "Sentadilla a una pierna",
		difficulty: "advanced",
		muscle_group: "piernas",
		type: "strength"
	},
	{
		name: "Zancadas",
		description: "Lunges alternando piernas",
		difficulty: "beginner",
		muscle_group: "piernas",
		type: "strength"
	},
	{
		name: "Saltos pliométricos",
		description: "Saltos explosivos",
		difficulty: "intermediate",
		muscle_group: "piernas",
		type: "explosive"
	},
	{
		name: "Step-ups",
		description: "Subir a banco o plataforma",
		difficulty: "beginner",
		muscle_group: "piernas",
		type: "strength"
	},

	// EQUILIBRIO Y MOVILIDAD
	{
		name: "Handstand hold",
		description: "Mantener equilibrio en pino",
		difficulty: "intermediate",
		muscle_group: "equilibrio",
		type: "skill"
	},
	{
		name: "Planche lean",
		description: "Avance progresivo para planche",
		difficulty: "advanced",
		muscle_group: "equilibrio",
		type: "skill"
	},
	{
		name: "Back bridge",
		description: "Puente de espalda para movilidad y fuerza",
		difficulty: "beginner",
		muscle_group: "movilidad",
		type: "endurance"
	}
].map(e => ({
	id: uuidv4(),
	...e
}));

// 3. ejercicio - tags
// map nombres -> IDs reales

// nombre de ejercicio -> id
const mapExercise = (name:string) => 
	exercises.find(e => e.name === name)!.id;

const mapTag = (name:string) =>
	tags.find(t => t.name === name)!.id;

const exerciseTags = [
	// Flexiones → sin material + push
	{ exercise_id: mapExercise("Flexiones"), tag_id: mapTag("sin material") },
	{ exercise_id: mapExercise("Flexiones"), tag_id: mapTag("push") },

	// Dips → sin material + push
	{ exercise_id: mapExercise("Dips en paralelas"), tag_id: mapTag("sin material") },
	{ exercise_id: mapExercise("Dips en paralelas"), tag_id: mapTag("push") },

	// Dominadas pronas → barra fija + pull
	{ exercise_id: mapExercise("Dominadas pronas"), tag_id: mapTag("barra fija") },
	{ exercise_id: mapExercise("Dominadas pronas"), tag_id: mapTag("pull") },

	// Muscle-up → barra fija + pull + explosivo
	{ exercise_id: mapExercise("Muscle-up"), tag_id: mapTag("barra fija") },
	{ exercise_id: mapExercise("Muscle-up"), tag_id: mapTag("pull") },
	{ exercise_id: mapExercise("Muscle-up"), tag_id: mapTag("explosivo") },

	// Plancha frontal → core
	{ exercise_id: mapExercise("Plancha frontal"), tag_id: mapTag("core") },

	// Pistol squat → piernas + equilibrio
	{ exercise_id: mapExercise("Sentadilla pistol"), tag_id: mapTag("piernas") },
	{ exercise_id: mapExercise("Sentadilla pistol"), tag_id: mapTag("equilibrio") }
];

// seed main function

async function seed() {
	console.log("seeding tags...")
	for(const t of tags){
		await executeWithRetry(client => 
			client.execute({
				sql: `INSERT INTO tags (id, name) VALUES (?,?)`,
				args: [t.id, t.name]
			})
		)
	}

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

	console.log("seeding exercises tags...")
	for(const et of exerciseTags){		
		await executeWithRetry(client =>
			client.execute({
				sql:`
					INSERT INTO exercise_tags (exercise_id, tag_id) VALUES (?,?)
				`,
				args: [et.exercise_id, et.tag_id]
			})
		)
	}
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
