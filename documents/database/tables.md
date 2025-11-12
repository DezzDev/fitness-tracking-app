-- =====================================
-- SCHEMA: Tablas principales
-- =====================================

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL CHECK(email LIKE '%@%.__%'),
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK(age BETWEEN 15 AND 120),
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
  profile_image TEXT,
	is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Exercises
CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK(difficulty IN ('beginner','intermediate','advanced')),
  muscle_group TEXT,
  type TEXT CHECK(type IN ('strength','endurance','skill','explosive)),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Workouts
CREATE TABLE IF NOT EXISTS workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Workout_Exercises
CREATE TABLE IF NOT EXISTS workout_exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id INTEGER NOT NULL,
  exercise_id INTEGER NOT NULL,
  sets INTEGER NOT NULL DEFAULT 1,
  reps INTEGER,
  duration_seconds INTEGER,
  rest_seconds INTEGER,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

-- 5. Progress Logs
CREATE TABLE IF NOT EXISTS progress_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  log_date DATE NOT NULL,
  body_weight REAL,
  body_fat_percent REAL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================
-- SCHEMA: Tags y Goals/PRs
-- =====================================

-- 6. Tags
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

-- 7. Exercise_Tags
CREATE TABLE IF NOT EXISTS exercise_tags (
  exercise_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (exercise_id, tag_id),
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- 8. User Goals
CREATE TABLE IF NOT EXISTS user_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  exercise_id INTEGER NOT NULL,
  target_reps INTEGER,
  target_duration_seconds INTEGER,
  target_weight REAL,
  notes TEXT,
  achieved BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

-- 9. Personal Records
CREATE TABLE IF NOT EXISTS personal_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  exercise_id INTEGER NOT NULL,
  max_reps INTEGER,
  max_duration_seconds INTEGER,
  max_weight REAL,
  achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

-- =====================================
-- DATA: Usuarios de prueba
-- =====================================

INSERT INTO users (username, email, password_hash) VALUES
('daniel', 'daniel@example.com', 'hashed_pw'),
('alex', 'alex@example.com', 'hashed_pw');

-- =====================================
-- DATA: Tags comunes
-- =====================================

INSERT INTO tags (name) VALUES
('sin material'),
('barra fija'),
('anillas'),
('explosivo'),
('core'),
('piernas'),
('push'),
('pull'),
('equilibrio'),
('movilidad');

-- =====================================
-- DATA: Ejercicios de Calistenia
-- =====================================

INSERT INTO exercises (name, description, difficulty, muscle_group, type) VALUES
-- PUSH
('Flexiones', 'Clásicas flexiones de pecho', 'beginner', 'pecho', 'strength'),
('Flexiones diamante', 'Flexiones con manos juntas para tríceps', 'intermediate', 'pecho', 'strength'),
('Flexiones pino asistidas', 'Flexión en vertical asistida contra pared', 'intermediate', 'hombros', 'strength'),
('Flexiones pino libres', 'Flexiones en pino sin apoyo', 'advanced', 'hombros', 'strength'),
('Dips en paralelas', 'Fondos en barras paralelas', 'intermediate', 'tríceps', 'strength'),

-- PULL
('Dominadas pronas', 'Dominadas agarre prono', 'beginner', 'espalda', 'strength'),
('Dominadas supinas', 'Dominadas agarre supino', 'beginner', 'espalda', 'strength'),
('Dominadas explosivas', 'Dominadas con impulso explosivo', 'advanced', 'espalda', 'explosive'),
('Muscle-up', 'Transición de dominada a dip en barra', 'advanced', 'full-body', 'skill'),

-- CORE
('Plancha frontal', 'Mantener cuerpo recto apoyado en antebrazos', 'beginner', 'core', 'endurance'),
('Plancha lateral', 'Plancha apoyando un solo brazo', 'intermediate', 'core', 'endurance'),
('Dragon flag', 'Ejercicio avanzado para abdomen y core', 'advanced', 'core', 'strength'),
('L-sit', 'Mantener posición en L sobre paralelas o suelo', 'intermediate', 'core', 'skill'),
('V-ups', 'Ejercicio abdominal subiendo piernas y tronco', 'intermediate', 'core', 'strength'),

-- PIERNAS
('Sentadillas', 'Squats clásicas con peso corporal', 'beginner', 'piernas', 'strength'),
('Sentadilla pistol', 'Sentadilla a una pierna', 'advanced', 'piernas', 'strength'),
('Zancadas', 'Lunges alternando piernas', 'beginner', 'piernas', 'strength'),
('Saltos pliométricos', 'Saltos explosivos', 'intermediate', 'piernas', 'explosive'),
('Step-ups', 'Subir a banco o plataforma', 'beginner', 'piernas', 'strength'),

-- EQUILIBRIO Y MOVILIDAD
('Handstand hold', 'Mantener equilibrio en pino', 'intermediate', 'equilibrio', 'skill'),
('Planche lean', 'Avance progresivo para planche', 'advanced', 'equilibrio', 'skill'),
('Back bridge', 'Puente de espalda para movilidad y fuerza', 'beginner', 'movilidad', 'endurance');

-- =====================================
-- DATA: Asociaciones ejercicio-tags
-- (ejemplo: puedes extender con más combinaciones)
-- =====================================

-- Flexiones -> sin material + push
INSERT INTO exercise_tags (exercise_id, tag_id) VALUES (1, 1), (1, 7);

-- Dips -> sin material + push
INSERT INTO exercise_tags (exercise_id, tag_id) VALUES (5, 1), (5, 7);

-- Dominadas -> barra fija + pull
INSERT INTO exercise_tags (exercise_id, tag_id) VALUES (6, 2), (6, 8);

-- Muscle-up -> barra fija + pull + explosivo
INSERT INTO exercise_tags (exercise_id, tag_id) VALUES (9, 2), (9, 8), (9, 4);

-- Plancha frontal -> core
INSERT INTO exercise_tags (exercise_id, tag_id) VALUES (10, 5);

-- Pistol squat -> piernas + equilibrio
INSERT INTO exercise_tags (exercise_id, tag_id) VALUES (16, 6), (16, 9);
