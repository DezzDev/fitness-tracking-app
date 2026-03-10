import type {
  WorkoutTemplate,
  WorkoutTemplateExercise,
  WorkoutSessionWithExercises,
  WorkoutSessionSet,
} from '@/types';

/**
 * Converts a WorkoutTemplate into a local WorkoutSessionWithExercises shape
 * so that ActiveSession can render it without creating anything in the database.
 *
 * Template set targets (targetReps, targetWeight, etc.) are mapped to
 * the corresponding session set fields (reps, weight, etc.).
 * When the template exercise has no detailed sets, placeholder sets are
 * generated from suggestedSets / suggestedReps.
 */
export function templateToSession(
  template: WorkoutTemplate
): WorkoutSessionWithExercises {
  return {
    id: '',
    userId: '',
    templateId: template.id,
    title: template.name,
    notes: template.description,
    sessionDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    templateName: template.name,
    exercises: template.exercises.map((ex) => ({
      id: '',
      sessionId: '',
      exerciseId: ex.exerciseId,
      orderIndex: ex.orderIndex,
      exerciseName: ex.exerciseName,
      exerciseDescription: ex.exerciseDescription,
      difficulty: ex.difficulty,
      muscleGroup: ex.muscleGroup,
      type: ex.type,
      sets: buildSetsFromTemplate(ex),
    })),
  };
}

/**
 * Builds WorkoutSessionSet[] from a template exercise.
 *
 * If the exercise has detailed `sets` (WorkoutTemplateSet[]), each one is
 * mapped to a session set copying the target values.
 *
 * Otherwise, `suggestedSets` (default 3) placeholder sets are created using
 * `suggestedReps` as the reps value.
 */
function buildSetsFromTemplate(
  ex: WorkoutTemplateExercise
): WorkoutSessionSet[] {
  if (ex.sets && ex.sets.length > 0) {
    return ex.sets.map((ts) => ({
      id: '',
      sessionExerciseId: '',
      setNumber: ts.setNumber,
      reps: ts.targetReps,
      weight: ts.targetWeight,
      durationSeconds: ts.targetDurationSeconds,
      restSeconds: ts.targetRestSeconds,
      notes: undefined,
      createdAt: '',
    }));
  }

  // Fallback: generate placeholder sets from suggestedSets / suggestedReps
  const count = ex.suggestedSets ?? 3;
  return Array.from({ length: count }, (_, i) => ({
    id: '',
    sessionExerciseId: '',
    setNumber: i + 1,
    reps: ex.suggestedReps,
    weight: undefined,
    durationSeconds: undefined,
    restSeconds: undefined,
    notes: undefined,
    createdAt: '',
  }));
}
