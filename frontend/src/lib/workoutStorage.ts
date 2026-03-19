import type { PersistedWorkoutState } from '@/types/storage';

export const STORAGE_KEY = 'fitness-app:active-session';

export const TTL_HOURS = 24;

export function isExpired(lastUpdated: string): boolean {
  const now = new Date().getTime();
  const updated = new Date(lastUpdated).getTime();
  const diffHours = (now - updated) / (1000 * 60 * 60);
  return diffHours > TTL_HOURS;
}

export function validatePersistedState(data: any): data is PersistedWorkoutState {
  return (
    data &&
    typeof data === 'object' &&
    data.version === 1 &&
    typeof data.templateId === 'string' &&
    data.localSession &&
    Array.isArray(data.editableSets) &&
    typeof data.currentExerciseIndex === 'number' &&
    typeof data.accumulatedElapsedMs === 'number' &&
    typeof data.lastResumedAt === 'string' &&
    typeof data.startTime === 'string' &&
    typeof data.lastUpdated === 'string' &&
    data.source === 'start'
  );
}

export function clearWorkoutStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}
