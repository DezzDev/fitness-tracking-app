# Workout Flow Unification - Especificación

## Objetivo

Unificar el flujo de ejecución de entrenamientos eliminando código duplicado entre DashboardPage y StartSessionPage. DashboardPage delegará toda la ejecución a StartSessionPage.

---

## Estado Actual

### DashboardPage (207 líneas)
- Renderiza `EntryScreen` si hay plantilla programada
- Tiene estado `ScreenType = "loading" | "entry" | "active" | "complete" | "entry-done"`
- Gestiona `localSession`, `completedSets`, `startTime`
- Renderiza `ActiveSession` y `CompletionScreen` directamente
- `handleStart` → crea sesión local y cambia a `screen="active"`
- `handleReturn` → cambia a `screen="entry-done"`

### StartSessionPage (140 líneas)
- Recibe `templateId` por query param
- Tiene estado `Screen = 'loading' | 'active' | 'complete' | 'error'`
- Gestiona `localSession`, `completedSets`, `startTime`
- Renderiza `ActiveSession` y `CompletionScreen` directamente
- `handleCancel` → `navigate('/workouts')`

### Código duplicado (~150 líneas idénticas)
Ambas páginas tienen lógica casi idéntica para:
- Construcción de `localSession` desde template
- Manejo de `startTime`
- `handleComplete` → crea sesión en BD + cambia screen
- `handleCancel` → limpia estado
- Renderizado de `ActiveSession` y `CompletionScreen`

---

## Plan de Implementación

### Fase 1: Simplificar DashboardPage

**Objetivo:** DashboardPage solo muestra EntryScreen y navega a StartSessionPage.

**Cambios en `DashboardPage.tsx`:**

1. **Eliminar imports innecesarios:**
   ```typescript
   // ELIMINAR
   import ActiveSession from '../components/ActiveSession';
   import CompletionScreen from '../components/CompletionScreen';
   import { templateToSession } from '../utils/templateToSession';
   import { useCreateSession } from '@/features/workouts/hooks/useWorkoutSessions';
   import type { WorkoutSessionWithExercises, EditableSet } from '@/types';
   ```

2. **Eliminar estados innecesarios:**
   ```typescript
   // ELIMINAR
   const [localSession, setLocalSession] = useState<WorkoutSessionWithExercises | null>(null);
   const [completedSets, setCompletedSets] = useState<EditableSet[][] | null>(null);
   const [startTime, setStartTime] = useState<Date | null>(null);
   ```

3. **Simplificar estado de screen:**
   ```typescript
   // ANTES
   type ScreenType = "loading" | "entry" | "active" | "complete" | "entry-done";
   
   // DESPUÉS
   type ScreenType = "loading" | "entry";
   ```

4. **Eliminar `createSessionMutation`** (ya no crea sesión aquí)

5. **Reemplazar `handleStart`:**
   ```typescript
   // ANTES (líneas 34-42)
   const handleStart = () => {
     if (!scheduledTemplate) return;
     const session = templateToSession(scheduledTemplate);
     setLocalSession(session);
     setStartTime(new Date());
     setScreen("active");
   };
   
   // DESPUÉS
   const handleStart = () => {
     if (!scheduledTemplate) return;
     navigate(`/workouts/sessions/start?templateId=${scheduledTemplate.id}`);
   };
   ```

6. **Eliminar `handleComplete` y `handleCancel`** (ya no se usan)

7. **Eliminar `handleReturn`** (ya no se usa)

8. **Simplificar `useEffect`**:
   ```typescript
   useEffect(() => {
     if (!isLoading) {
       setScreen("entry");
     }
   }, [isLoading]);
   ```

9. **Simplificar `switch` de screens:**
   - Mantener `case "entry"`
   - Eliminar `case "entry-done"`, `case "active"`, y `case "complete"`
   - Eliminar renderizado de `ActiveSession` y `CompletionScreen`

10. **Agregar detección de completitud:**
    ```typescript
    import { useWorkoutSessions } from '@/features/workouts/hooks/useWorkoutSessions';
    
    // En el componente:
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();
    
    const { data: todaySessions } = useWorkoutSessions({
      startDate: startOfDay,
      endDate: endOfDay,
    });
    
    const isCompletedToday = scheduledTemplate
      ? todaySessions?.sessions.some(s => s.templateId === scheduledTemplate.id)
      : false;
    ```

**Resultado esperado:** ~120 líneas (desde 207)

---

### Fase 2: Actualizar StartSessionPage

**Objetivo:** Unificar `handleReturn` para usar `navigate(-1)`.

**Cambios en `StartSessionPage.tsx`:**

1. **Reemplazar `handleReturn`:**
   ```typescript
   // ANTES (líneas 79-81)
   const handleReturn = () => {
     navigate('/workouts');
   };
   
   // DESPUÉS
   const handleReturn = () => {
     navigate(-1);
   };
   ```

---

### Fase 3: Actualizar EntryScreen

**Objetivo:** Remover props que ya no son necesarias y navegar directamente.

**Cambios en `EntryScreen.tsx`:**

1. **Simplificar props:**
   ```typescript
   // ANTES
   interface EntryScreenProps {
     template: WorkoutTemplate;
     onStart: () => void;
     completed: boolean;
     isCreatingSession?: boolean;
   }
   
   // DESPUÉS
   interface EntryScreenProps {
     template: WorkoutTemplate;
     completed: boolean;
   }
   ```

2. **Eliminar `onStart` y `isCreatingSession`**

3. **Actualizar botón "INICIAR SESIÓN":**
   ```typescript
   // ANTES (línea 90-91)
   <button
     onClick={onStart}
   
   // DESPUÉS
   <button
     onClick={() => navigate(`/workouts/sessions/start?templateId=${template.id}`)}
   ```

---

### Fase 4: Actualizar CompletionScreen

**Objetivo:** Cambiar texto del botón "VOLVER AL DASHBOARD" a "VOLVER".

**Cambios en `CompletionScreen.tsx`:**

1. **Reemplazar texto del botón (línea 155):**
   ```typescript
   // ANTES
   VOLVER AL DASHBOARD
   
   // DESPUÉS
   VOLVER
   ```

---

## Resumen de Cambios

| Archivo | Cambios | Líneas |
|---------|---------|--------|
| `DashboardPage.tsx` | Eliminar ActiveSession, CompletionScreen, estados duplicados. Navegar a StartSessionPage. Agregar query de sesiones. | -90 |
| `StartSessionPage.tsx` | Cambiar `handleReturn` a `navigate(-1)` | ±1 |
| `EntryScreen.tsx` | Eliminar `onStart` y `isCreatingSession`. Navegar internamente. | -5 |
| `CompletionScreen.tsx` | Cambiar texto del botón | ±1 |
| **TOTAL** | | ~-93 |

---

## Flujo Final

```
1. Usuario entra a DashboardPage
   → Si hay plantilla programada:
     → Query sesiones de hoy
     → EntryScreen con completed=true/false
   → Si no hay plantilla:
     → Pantalla "SIN PLANTILLA" + botón "ELEGIR PLANTILLA"

2. Usuario hace click en "INICIAR SESIÓN"
   → Navega a /workouts/sessions/start?templateId=xxx

3. StartSessionPage recibe templateId
   → Muestra ActiveSession
   → Usuario completa workout
   → CompletionScreen
   → Usuario clickea "VOLVER"
   → navigate(-1) → vuelve a DashboardPage

4. DashboardPage detecta sesión completada
   → EntryScreen muestra "COMPLETADO"
```

---

## Verificación

Después de implementar:

1. ✅ Ir a Dashboard → Ver plantilla programada → Click "INICIAR SESIÓN" → Ir a StartSessionPage
2. ✅ Completar workout → "VOLVER" → Volver a Dashboard
3. ✅ Dashboard muestra "COMPLETADO" badge
4. ✅ Sin código duplicado (ActiveSession/CompletionScreen solo en StartSessionPage)
5. ✅ Ir a Dashboard sin plantilla → "SIN PLANTILLA" + botón funciona
6. ✅ Navegar a /workouts → Elegir plantilla → StartSessionPage → Completar → Volver

---

## Siguiente Paso (POST-Unificación)

Una vez completada la unificación, implementar la feature de persistencia según `docs/specs/WORKOUT_PERSISTENCE_SPEC.md`.

**Nota importante:** Después de esta unificación, el spec de persistencia solo necesitará UNA key de localStorage (`fitness-app:active-session`) en lugar de dos, simplificando la implementación.
