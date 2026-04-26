import { randomUUID } from 'crypto';
import { connectDatabase, batch, disconnectDatabase } from '@/config/database';


// 1. Tags

export const tags = [
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
  id: randomUUID(),
  name
}));

// 2. Exercises

const exercises = [

  {
    name: "Crunch abdominal",
    description: "Flexión de tronco controlada enfocada en el recto abdominal, ideal para principiantes",
    difficulty: "beginner",
    muscle_group: "core",
    type: "fuerza"
  },
  {
    name: "Hanging knee raises",
    description: "Elevación de rodillas en barra, perfecta para iniciar el trabajo de core en suspensión",
    difficulty: "beginner",
    muscle_group: "core",
    type: "fuerza"
  },
  {
    name: "Hanging leg raises",
    description: "Elevación de piernas estiradas en barra que exige mayor control y fuerza abdominal",
    difficulty: "intermediate",
    muscle_group: "core",
    type: "fuerza"
  },
  {
    name: "Toes to bar",
    description: "Elevación explosiva hasta tocar la barra con los pies, máxima activación del core y coordinación",
    difficulty: "advanced",
    muscle_group: "core",
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

  for (const e of exercises) {
    exerciseQueries.push({
      sql: `
					INSERT INTO exercises (id, name, description, difficulty, muscle_group, type, created_at)
					VALUES (?,?,?,?,?,?, CURRENT_TIMESTAMP)
				`,
      args: [e.id, e.name, e.description, e.difficulty, e.muscle_group, e.type]
    })
  }
  console.log({ exerciseQueries: exerciseQueries.map(q => ({ sql: q.sql, args: q.args.map(a => typeof a === 'string' ? a.substring(0, 20) : a) })) });
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

const start = async (): Promise<void> => {
  let exitCode = 0;

  try {
    await connectDatabase();
    await seed();
  } catch (err) {
    exitCode = 1;
    console.error('seed failed', err);
  } finally {
    await disconnectDatabase();
  }

  process.exit(exitCode);
};

void start();
