import { randomUUID } from 'crypto';
import { connectDatabase, batch} from '@/config/database';
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
		name: "Dominadas con agarre neutro",
		description: "Dominadas con agarre paralelo que reducen el estrés en hombros y maximizan la activación de dorsales y bíceps",
		difficulty: "intermediate",
		muscle_group: "espalda",
		type: "fuerza"
	},
	{
		name: "Flexiones escapulares",
		description: "Flexión escapular sin doblar brazos, ideal para activar serrato anterior y mejorar la estabilidad del hombro",
		difficulty: "beginner",
		muscle_group: "hombros",
		type: "mobilidad"
	},
	{
		name: "Rotaciones externas de hombros",
		description: "Ejercicio correctivo para fortalecer el manguito rotador y prevenir lesiones en el hombro",
		difficulty: "beginner",
		muscle_group: "hombros",
		type: "mobilidad"
	},
	{
		name: "Face pull",
		description: "Tirón hacia la cara con enfoque en deltoides posterior y estabilidad escapular",
		difficulty: "beginner",
		muscle_group: "hombros",
		type: "fuerza"
	},
	{
		name: "Flexiones declinadas",
		description: "Flexiones con pies elevados para aumentar la carga sobre pecho superior y hombros",
		difficulty: "intermediate",
		muscle_group: "pecho",
		type: "fuerza"
	},
	{
		name: "Elevaciones Y",
		description: "Elevaciones en forma de Y para activar trapecio inferior y mejorar postura",
		difficulty: "beginner",
		muscle_group: "hombros",
		type: "mobilidad"
	},
	{
		name: "Elevaciones T",
		description: "Elevaciones en forma de T centradas en deltoides posterior y control escapular",
		difficulty: "beginner",
		muscle_group: "hombros",
		type: "mobilidad"
	},
	{
		name: "Elevaciones W",
		description: "Movimiento en W enfocado en la retracción escapular y fortalecimiento del manguito rotador",
		difficulty: "beginner",
		muscle_group: "hombros",
		type: "mobilidad"
	},
	{
		name: "Hollow body hold",
		description: "Ejercicio isométrico clave para desarrollar un core sólido y transferir fuerza en calistenia",
		difficulty: "intermediate",
		muscle_group: "core",
		type: "isométrico"
	},
	{
		name: "Dead hang",
		description: "Suspensión pasiva en barra que mejora agarre, descompresión espinal y salud del hombro",
		difficulty: "beginner",
		muscle_group: "espalda",
		type: "isométrico"
	},
	{
		name: "Dominadas negativas",
		description: "Fase excéntrica controlada de la dominada para ganar fuerza y progresar hacia dominadas completas",
		difficulty: "beginner",
		muscle_group: "espalda",
		type: "fuerza"
	},
	{
		name: "Extensores de muñeca",
		description: "Trabajo específico de antebrazo para equilibrar musculatura y prevenir lesiones en muñeca y codo",
		difficulty: "beginner",
		muscle_group: "antebrazo",
		type: "fuerza"
	}
].map(e => ({
	id: randomUUID(),
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

  const exerciseQueries: Array<{ sql: string, args: any[] }> = [];

 for(const e of exercises){
  exerciseQueries.push({
    sql: `
					INSERT INTO exercises (id, name, description, difficulty, muscle_group, type)
					VALUES (?,?,?,?,?,?)
				`,
    args: [e.id, e.name, e.description, e.difficulty, e.muscle_group, e.type]
  })
 }

 console.log("seeding exercises...")
 await batch(exerciseQueries);
	
	

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
		
		seed()
    .then(process.exit(0))
    .catch(err => {
			console.error("seed failed", err);
			process.exit(1)
		}).finally(()=>{
			process.exit(1);
		})
	});

}

start();
