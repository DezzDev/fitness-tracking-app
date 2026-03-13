# ADR-013: Separated Workout Templates and Sessions

**Status**: Accepted  
**Date**: 2025-01-01  
**Scope**: Backend, Frontend, Domain Model

## Context

The application tracks workouts. A key modeling question: should a "workout" be a single entity that can be both a plan and a log, or should planning and logging be separate concepts?

## Decision

Separate workouts into two distinct entities:

- **Workout Templates**: Reusable plans defining which exercises to perform, with target sets, reps, and weights. Can be scheduled to a day of the week, favorited, and duplicated.
- **Workout Sessions**: Actual workout logs recording what was performed, including real reps, weights, duration, completion status, and notes. A session can optionally reference the template it was created from.

### Relationship

```
WorkoutTemplate (plan)
    │
    │  POST /workoutSessions/from-template
    │  Copies exercises + target sets into a new session
    │
    ▼
WorkoutSession (log)
    ├── SessionExercise[] (exercises performed)
    │       └── SessionSet[] (individual sets with actual values)
    └── templateId (optional back-reference)
```

A session can also be created independently (without a template).

### Entity Separation

| Concern | Template | Session |
|---------|----------|---------|
| Purpose | Reusable plan | Historical log |
| Exercises | Template exercises with target values | Session exercises with actual values |
| Sets | Target reps/weight (suggested) | Actual reps/weight/duration + completion flag |
| Time | No date; optional `scheduledDayOfWeek` (0-6) | `sessionDate`, `durationMinutes` |
| Features | Favorite, duplicate, schedule | Duplicate (to new date), date-range query, stats |
| Mutability | Editable (updating the plan) | Editable (correcting the log) |

## Consequences

### Positive

- **Clean separation of intent**: "What I plan to do" vs. "What I actually did" are fundamentally different data shapes
- **Template reuse**: One template can generate unlimited sessions; modifying the template does not alter past sessions
- **Session independence**: Sessions can exist without templates (ad-hoc workouts)
- **Scheduling**: Templates can be assigned to days of the week (`/workoutTemplates/today`) without requiring a session to exist
- **Stats per concept**: Template stats (usage count, favorites) and session stats (total duration, volume, frequency) are calculated independently

### Negative

- **Data duplication**: Creating a session from a template copies exercise data. If the template changes, existing sessions are not updated (by design, but adds data volume).
- **Two CRUD surfaces**: Frontend needs separate forms, lists, and detail views for templates and sessions (doubles the UI surface area for workouts)
- **Complexity**: 5 backend files per entity (route, controller, service, repository, schema) times 2 = 10 files for the workout domain

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Single "Workout" entity with `status` field (planned/completed) | Conflates plan and log; editing a plan would alter historical data |
| Templates only, sessions as a log table | Loses the ability to have standalone sessions without templates |
| Sessions only, "favorite" flag for reusable ones | Cannot have target vs. actual values in the same row without confusing semantics |

## References

- Domain model: `docs/architecture/05-domain-model.md`
- Data flow (session from template): `docs/architecture/04-data-flow.md` (section 3)
- Template routes: `backend/src/routes/workoutTemplate.routes.ts`
- Session routes: `backend/src/routes/workoutSession.routes.ts`
