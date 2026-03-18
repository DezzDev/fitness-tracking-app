import { useCallback, useEffect, useRef, useState } from 'react';
import type { PersistedWorkoutState } from '@/types/storage';
import { STORAGE_KEY, validatePersistedState, isExpired } from '@/lib/workoutStorage';

export function useWorkoutPersistence() {
  const [hasPersistedState, setHasPersistedState] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);

  // Check on mount if there's persisted state
  useEffect(() => {
    const existing = loadPersistedState();
    setHasPersistedState(!!existing);
  }, []);

  const loadPersistedState = useCallback((): PersistedWorkoutState | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const data = JSON.parse(raw);
      
      // Validate schema
      if (!validatePersistedState(data)) {
        console.warn('[useWorkoutPersistence] Invalid persisted state, clearing...');
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      // Check expiration (24 hours)
      if (isExpired(data.lastUpdated)) {
        console.info('[useWorkoutPersistence] Persisted state expired, clearing...');
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return data;
    } catch (err) {
      console.error('[useWorkoutPersistence] Error loading state:', err);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }, []);

  const saveState = useCallback((state: PersistedWorkoutState) => {
    // Debounce: wait 500ms of inactivity before saving
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const payload = {
          ...state,
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (err) {
        // Quota exceeded or localStorage error
        console.error('[useWorkoutPersistence] Error saving state:', err);
      }
    }, 500); // 500ms debounce
  }, []);

  const clearState = useCallback(() => {
    // Clear immediately (no debounce)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    localStorage.removeItem(STORAGE_KEY);
    setHasPersistedState(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    loadPersistedState,
    saveState,
    clearState,
    hasPersistedState,
  };
}
