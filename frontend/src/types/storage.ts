import type { WorkoutSessionWithExercises, EditableSet } from './index';

export interface PersistedWorkoutState {
  version: 1;
  templateId: string;
  localSession: WorkoutSessionWithExercises;
  editableSets: EditableSet[][];
  currentExerciseIndex: number;
  startTime: string;
  lastUpdated: string;
  source: 'start';
}
