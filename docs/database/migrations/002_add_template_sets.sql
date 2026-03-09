-- Migration: Add workout_template_sets table
-- Allows defining target values (reps, weight, duration, rest) per individual set
-- within a workout template exercise, instead of only generic suggestedSets/suggestedReps.

CREATE TABLE workout_template_sets (
  id TEXT PRIMARY KEY,
  template_exercise_id TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  target_reps INTEGER,
  target_weight REAL,
  target_duration_seconds INTEGER,
  target_rest_seconds INTEGER,
  FOREIGN KEY (template_exercise_id) REFERENCES workout_template_exercises(id) ON DELETE CASCADE
);
