-- =====================================
-- Tablas
-- =====================================

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
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

-- Exercises
CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK(difficulty IN ('beginner','intermediate','advanced')),
  muscle_group TEXT,
  type TEXT CHECK(type IN ('strength','endurance','skill','explosive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Progress Logs
CREATE TABLE IF NOT EXISTS progress_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  log_date DATE NOT NULL,
  body_weight REAL,
  body_fat_percent REAL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Exercise_Tags
CREATE TABLE IF NOT EXISTS exercise_tags (
  exercise_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (exercise_id, tag_id),
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- User Goals
CREATE TABLE IF NOT EXISTS user_goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  target_reps INTEGER,
  target_duration_seconds INTEGER,
  target_weight REAL,
  notes TEXT,
  achieved BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

-- Personal Records
CREATE TABLE IF NOT EXISTS personal_records (
  id TEXT PRIMARY KEY ,
  user_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  max_reps INTEGER,
  max_duration_seconds INTEGER,
  max_weight REAL,
  achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

CREATE TABLE workout_templates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  scheduled_day_of_week INTEGER CHECK(scheduled_day_of_week BETWEEN 0 AND 6) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	deleted_at DATETIME DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE workout_template_exercises (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  suggested_sets INTEGER,
  suggested_reps INTEGER,
  notes TEXT,
  FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

CREATE TABLE template_favorites (
  user_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, template_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE CASCADE
);

CREATE TABLE workout_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  template_id TEXT,
  title TEXT NOT NULL,
  notes TEXT,
  session_date DATETIME NOT NULL,
  duration_minutes INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE SET NULL
);

CREATE TABLE workout_session_exercises (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

CREATE TABLE workout_session_sets (
  id TEXT PRIMARY KEY,
  session_exercise_id TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  reps INTEGER,
  duration_seconds INTEGER,
  weight REAL,
  rest_seconds INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_exercise_id) REFERENCES workout_session_exercises(id) ON DELETE CASCADE
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
