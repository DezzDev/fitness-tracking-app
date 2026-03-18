# Workout Persistence - Especificación Técnica

## Objetivo

Permitir que los usuarios puedan refrescar la página o cerrar el navegador durante un entrenamiento activo sin perder su progreso. Los datos se guardan automáticamente en localStorage y se restauran al volver.

---

## Decisiones de Diseño

### Tecnologías y Configuración

| Decisión | Valor | Justificación |
|----------|-------|---------------|
| **Storage** | localStorage | Suficiente (~5-10MB) para datos típicos de sesión (~3-5KB). API síncrona, simple y rápida. |
| **Debounce** | 500ms | Balance óptimo entre responsividad y eficiencia. Evita writes excesivos durante edición rápida. |
| **TTL** | 24 horas | Tiempo razonable para completar un entrenamiento. Previene datos obsoletos. |
| **Restauración** | Automática | UX fluida: sin modales ni preguntas, restaura directamente. |
| **Conflicto (StartSession)** | Modal bloqueante | Obligatorio elegir: continuar entrenamiento anterior o descartar. |
| **Notificaciones** | Ninguna | Decisión explícita del usuario: sin toasts ni banners. |

---

## Arquitectura de Datos

### Keys de localStorage

```typescript
'fitness-app:active-session-dashboard'  // Sesiones iniciadas desde DashboardPage
'fitness-app:active-session-start'      // Sesiones iniciadas desde StartSessionPage
```

### Estructura del Payload

```typescript
interface PersistedWorkoutState {
  version: 1;                                    // Para futuras migraciones de esquema
  templateId: string;                           // ID de la plantilla original
  localSession: WorkoutSessionWithExercises;    // Sesión con estructura completa
  editableSets: EditableSet[][];               // Sets editados por cada ejercicio
  currentExerciseIndex: number;                  // Índice del ejercicio activo (0-based)
  startTime: string;                            // ISO string: cuándo inició el workout
  lastUpdated: string;                          // ISO string: última modificación
  source: 'dashboard' | 'start';               // Origen para debugging
}
```

### Tamaño Estimado

- **Por sesión:** ~3-5KB
- **Límite localStorage:** ~5-10MB
- **Sesiones almacenables:** cientos (sin necesidad de comprimir)

---

## Archivos a Crear

### 1. `frontend/src/types/storage.ts`

```typescript
import type { WorkoutSessionWithExercises, EditableSet } from './index';

export interface PersistedWorkoutState {
  version: 1;
  templateId: string;
  localSession: WorkoutSessionWithExercises;
  editableSets: EditableSet[][];
  currentExerciseIndex: number;
  startTime: string;
  lastUpdated: string;
  source: 'dashboard' | 'start';
}
```

### 2. `frontend/src/lib/workoutStorage.ts`

```typescript
import type { PersistedWorkoutState } from '@/types/storage';

export const STORAGE_KEYS = {
  DASHBOARD: 'fitness-app:active-session-dashboard',
  START: 'fitness-app:active-session-start',
} as const;

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
    typeof data.startTime === 'string' &&
    typeof data.lastUpdated === 'string' &&
    (data.source === 'dashboard' || data.source === 'start')
  );
}

export function clearAllWorkoutStorage(): void {
  localStorage.removeItem(STORAGE_KEYS.DASHBOARD);
  localStorage.removeItem(STORAGE_KEYS.START);
}
```

### 3. `frontend/src/hooks/useWorkoutPersistence.ts`

```typescript
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PersistedWorkoutState } from '@/types/storage';
import { STORAGE_KEYS, validatePersistedState, isExpired } from '@/lib/workoutStorage';

export function useWorkoutPersistence(source: 'dashboard' | 'start') {
  const storageKey = source === 'dashboard' ? STORAGE_KEYS.DASHBOARD : STORAGE_KEYS.START;
  const [hasPersistedState, setHasPersistedState] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check on mount if there's persisted state
  useEffect(() => {
    const existing = loadPersistedState();
    setHasPersistedState(!!existing);
  }, []);

  const loadPersistedState = useCallback((): PersistedWorkoutState | null => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;

      const data = JSON.parse(raw);
      
      // Validar esquema
      if (!validatePersistedState(data)) {
        console.warn('[useWorkoutPersistence] Invalid persisted state, clearing...');
        localStorage.removeItem(storageKey);
        return null;
      }

      // Verificar expiración (24 horas)
      if (isExpired(data.lastUpdated)) {
        console.info('[useWorkoutPersistence] Persisted state expired, clearing...');
        localStorage.removeItem(storageKey);
        return null;
      }

      return data;
    } catch (err) {
      console.error('[useWorkoutPersistence] Error loading state:', err);
      localStorage.removeItem(storageKey);
      return null;
    }
  }, [storageKey]);

  const saveState = useCallback((state: PersistedWorkoutState) => {
    // Debounce: esperar 500ms de inactividad antes de guardar
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const payload = {
          ...state,
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(payload));
      } catch (err) {
        // Quota exceeded o error de localStorage
        console.error('[useWorkoutPersistence] Error saving state:', err);
      }
    }, 500); // 500ms debounce
  }, [storageKey]);

  const clearState = useCallback(() => {
    // Limpiar inmediatamente (sin debounce)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    localStorage.removeItem(storageKey);
    setHasPersistedState(false);
  }, [storageKey]);

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
```

---

## Cambios en Componentes Existentes

### 4. `ActiveSession.tsx`

**Nuevos props:**

```typescript
interface ActiveSessionProps {
  session: WorkoutSessionWithExercises;
  onComplete: (editedSets: EditableSet[][]) => void;
  onCancel?: () => void;
  isCancelling?: boolean;
  initialEditableSets?: EditableSet[][];        // ← NUEVO: Para restaurar estado
  initialExerciseIndex?: number;                // ← NUEVO: Para restaurar índice
  onStateChange?: (sets: EditableSet[][], idx: number) => void; // ← NUEVO: Callback para persistir
}
```

**Cambios en código:**

```typescript
// Línea 34: Usar initialEditableSets si está presente
const [editableSets, setEditableSets] = useState<EditableSet[][]>(() =>
  initialEditableSets ?? buildEditableSets(session)
);

// Línea 35: Restaurar índice del ejercicio
const [currentIdx, setCurrentIdx] = useState(initialExerciseIndex ?? 0);

// Después de línea 64: Llamar callback en cada cambio
useEffect(() => {
  if (onStateChange) {
    onStateChange(editableSets, currentIdx);
  }
}, [editableSets, currentIdx, onStateChange]);
```

### 5. `DashboardPage.tsx`

**Estado actualizado:**

```typescript
type ScreenType = "loading" | "restoring" | "entry" | "active" | "complete" | "entry-done";
```

**Integración del hook:**

```typescript
const persistence = useWorkoutPersistence('dashboard');

// useEffect de restauración (después de línea 32):
useEffect(() => {
  if (!isLoading) {
    const persisted = persistence.loadPersistedState();
    
    if (persisted && scheduledTemplate && persisted.templateId === scheduledTemplate.id) {
      setLocalSession(persisted.localSession);
      setStartTime(new Date(persisted.startTime));
      setScreen("restoring");
      setTimeout(() => {
        setScreen("active");
      }, 1000);
    } else {
      if (persisted) {
        persistence.clearState();
      }
      setScreen("entry");
    }
  }
}, [isLoading, scheduledTemplate]);

// Callback para persistir cambios:
const handleStateChange = (sets: EditableSet[][], idx: number) => {
  if (localSession && scheduledTemplate) {
    persistence.saveState({
      version: 1,
      templateId: scheduledTemplate.id,
      localSession,
      editableSets: sets,
      currentExerciseIndex: idx,
      startTime: startTime!.toISOString(),
      lastUpdated: new Date().toISOString(),
      source: 'dashboard',
    });
  }
};

// Cleanup en handleComplete y handleCancel:
const handleComplete = (sets: EditableSet[][]) => {
  persistence.clearState(); // ← NUEVO
  // ... resto
};

const handleCancel = () => {
  persistence.clearState(); // ← NUEVO
  // ... resto
};

// Render del loader:
if (screen === "restoring") {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="font-barlow text-sm tracking-[2px] text-muted-foreground uppercase">
        RESTAURANDO PROGRESO...
      </p>
    </div>
  );
}

// Pasar props a ActiveSession:
case "active":
  const persisted = persistence.loadPersistedState();
  return (
    <ActiveSession
      session={localSession}
      onComplete={handleComplete}
      onCancel={handleCancel}
      initialEditableSets={persisted?.editableSets}
      initialExerciseIndex={persisted?.currentExerciseIndex}
      onStateChange={handleStateChange}
    />
  );
```

### 6. `StartSessionPage.tsx`

**Estados actualizados:**

```typescript
type Screen = 'loading' | 'restoring' | 'conflict' | 'active' | 'complete' | 'error';

const [conflictData, setConflictData] = useState<{
  persisted: PersistedWorkoutState;
  persistedTemplate: WorkoutTemplate | null;
} | null>(null);

const persistence = useWorkoutPersistence('start');
```

**Lógica de detección de conflictos:**

```typescript
if (template && screen === 'loading' && !isLoading) {
  const persisted = persistence.loadPersistedState();
  
  if (persisted) {
    if (persisted.templateId === template.id) {
      // Mismo template: restaurar
      setLocalSession(persisted.localSession);
      setScreen('restoring');
      setTimeout(() => setScreen('active'), 1000);
      return;
    } else {
      // Conflicto: otro template en progreso
      setConflictData({ persisted, persistedTemplate: template });
      setScreen('conflict');
      return;
    }
  }
  
  // No hay estado persisted
  const session = templateToSession(template);
  setLocalSession(session);
  setScreen('active');
}
```

**Modal de conflicto:**

```typescript
if (screen === 'conflict' && conflictData) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="mx-8 w-full max-w-md border border-border bg-background p-8 space-y-6">
        <div>
          <div className="font-bebas text-2xl tracking-[2px] text-foreground mb-2">
            ENTRENAMIENTO EN PROGRESO
          </div>
          <p className="font-barlow text-sm text-muted-foreground">
            Tienes un entrenamiento en progreso de{' '}
            <strong className="text-foreground">
              {conflictData.persisted.localSession.title}
            </strong>
            . ¿Qué deseas hacer?
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              setLocalSession(conflictData.persisted.localSession);
              setConflictData(null);
              setScreen('restoring');
              setTimeout(() => setScreen('active'), 1000);
            }}
            className="w-full bg-primary border-none text-black font-bebas text-[18px] tracking-[3px] py-4"
          >
            CONTINUAR ENTRENAMIENTO
          </button>
          <button
            onClick={() => {
              persistence.clearState();
              const session = templateToSession(template!);
              setLocalSession(session);
              setConflictData(null);
              setScreen('active');
            }}
            className="w-full bg-transparent border border-border text-muted-foreground font-barlow text-[13px] tracking-[3px] py-4"
          >
            DESCARTAR E INICIAR NUEVO
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 7. `authStore.ts`

**Cambio en logout():**

```typescript
logout: () => {
  authApi.logout();
  
  // Limpiar sesiones de entrenamiento activas
  localStorage.removeItem('fitness-app:active-session-dashboard');
  localStorage.removeItem('fitness-app:active-session-start');

  set({
    user: null,
    isAuthenticated: false,
    error: null
  })
},
```

---

## Flujos de Usuario

### Flujo 1: Refresh Durante Entrenamiento

```
1. Usuario está en ActiveSession (DashboardPage)
   → Ejercicio 3/5, sets 1 y 2 completados
2. Cada cambio → debounce 500ms → guardar en localStorage
3. Usuario refresca (F5)
4. DashboardPage monta → detecta persisted state
5. Screen = "restoring" → Loader "RESTAURANDO PROGRESO..." (1s)
6. Screen = "active" → ActiveSession con:
   → initialExerciseIndex = 2 (ejercicio 3)
   → initialEditableSets = [[set1✓, set2✓, set3], [set1, set2, set3], ...]
7. Usuario continúa donde quedó
```

### Flujo 2: Conflicto en StartSessionPage

```
1. Usuario inicia "Push Day" desde /workouts
2. Usuario está en medio del entrenamiento
3. Usuario cierra navegador (estado persiste)
4. Usuario vuelve y hace click en "Leg Day"
5. StartSessionPage detecta conflicto:
   → persisted.templateId = "push-day-id"
   → query param templateId = "leg-day-id"
6. Screen = "conflict" → Modal bloqueante
7. Usuario elige:
   a) "CONTINUAR ENTRENAMIENTO" → Restaura Push Day
   b) "DESCARTAR E INICIAR NUEVO" → Limpia y comienza Leg Day
```

### Flujo 3: Completar/Cancelar Entrenamiento

```
1. Usuario completa o cancela
2. handleComplete/handleCancel ejecuta:
   a. persistence.clearState() → localStorage limpio inmediatamente
   b. Screen cambia a "complete" o "entry"
3. No queda basura en localStorage
```

### Flujo 4: Logout

```
1. Usuario hace logout desde /profile
2. authStore.logout() limpia ambas keys de localStorage
3. Próximo login → no hay entrenamientos persistidos
```

---

## Edge Cases y Manejo

| Caso | Solución | Ubicación |
|------|----------|-----------|
| **localStorage lleno** | try/catch en saveState(), error logged | useWorkoutPersistence.ts:85 |
| **Datos corruptos** | validatePersistedState() = false → ignora y limpia | workoutStorage.ts:45 |
| **Template eliminado** | useWorkoutTemplate error → screen='error', clearState() | StartSessionPage.tsx:96 |
| **TemplateId no coincide** | Detectar en useEffect, limpiar y usar flujo normal | DashboardPage.tsx:35 |
| **Cambio de cuenta** | authStore.logout() limpia ambas keys | authStore.ts:100 |
| **Datos expirados (>24h)** | isExpired() valida en loadPersistedState() | workoutStorage.ts:30 |
| **StrictMode double-invoke** | Debounce de 500ms evita writes excesivos | useWorkoutPersistence.ts:70 |

---

## Testing Manual

Después de implementar, verificar:

1. ✅ **Refresh básico:** F5 en medio de entrenamiento → restaura correctamente
2. ✅ **Cerrar/abrir navegador:** Cerrar Chrome, reabrir → restaura correctamente
3. ✅ **Completar entrenamiento:** localStorage se limpia después de completar
4. ✅ **Cancelar entrenamiento:** localStorage se limpia después de cancelar
5. ✅ **Conflicto de templates:** Iniciar Template A, cerrar, abrir Template B → modal
6. ✅ **Logout:** Hacer logout → localStorage limpio
7. ✅ **TTL expirado:** Simular lastUpdated a 25h atrás → ignora datos
8. ✅ **Datos corruptos:** JSON inválido en localStorage → ignora y limpia
9. ✅ **Dashboard + StartSession:** Ambas páginas persisten independientemente
10. ✅ **Editar múltiples campos:** Cambios rápidos → solo 1 write después de 500ms

---

## Resumen de Archivos

| Acción | Archivo | Líneas Estimadas |
|--------|---------|-----------------|
| CREAR | `types/storage.ts` | 20 |
| CREAR | `lib/workoutStorage.ts` | 60 |
| CREAR | `hooks/useWorkoutPersistence.ts` | 120 |
| MODIFICAR | `ActiveSession.tsx` | +15 |
| MODIFICAR | `DashboardPage.tsx` | +80 |
| MODIFICAR | `StartSessionPage.tsx` | +120 |
| MODIFICAR | `authStore.ts` | +2 |
| **TOTAL** | | **~417 líneas** |

---

## Métricas

| Métrica | Valor |
|---------|-------|
| **Dependencias nuevas** | 0 |
| **Complejidad** | Media |
| **Impacto en performance** | Mínimo (debounce optimiza writes) |
| **Tamaño por sesión** | ~3-5KB |
| **Tiempo estimado implementación** | 2-3 horas |
