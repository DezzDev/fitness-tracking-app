# Domain Model

## 1. Entity Relationships

```
┌──────────┐        ┌──────────────────┐
│   User   │───────▶│ WorkoutTemplate  │ 1:N (user owns templates)
│          │        │                  │
│          │        │  - name          │
│          │        │  - description   │──────┐
│          │        │  - dayOfWeek     │      │
│          │        │  - isFavorite    │      │
│          │        └──────────────────┘      │
│          │                                  │
│          │        ┌──────────────────┐      │
│          │───────▶│ WorkoutSession   │ 1:N  │ N:1
│          │        │                  │◀─────┘ (session from template)
│          │        │  - title         │
│          │        │  - sessionDate   │
│          │        │  - duration      │
│          │        │  - notes         │
│          │        └────────┬─────────┘
│          │                 │
│          │                 │ 1:N
│          │                 ▼
│          │        ┌──────────────────────┐
│          │        │ SessionExercise      │
│          │        │  - orderIndex        │────────┐
│          │        └────────┬─────────────┘        │
│          │                 │                      │ N:1
│          │                 │ 1:N                  │
│          │                 ▼                      │
│          │        ┌──────────────────┐            │
│          │        │ SessionSet       │            │
│          │        │  - setNumber     │            │
│          │        │  - reps          │            │
│          │        │  - weight        │            │
│          │        │  - duration      │            │
│          │        │  - isCompleted   │            │
│          │        └──────────────────┘            │
│          │                                        │
│          │        ┌──────────────────┐            │
│          │───────▶│ PersonalRecord   │ 1:N        │
│          │        │  - type          │────────────┤
│          │        │  - value         │            │
│          │        │  - reps          │            │
│          │        │  - achievedAt    │            │
│          │        └──────────────────┘            │
└──────────┘                                        │
                    ┌──────────────────┐            │
                    │    Exercise      │◀───────────┘
                    │                  │ (referenced by templates,
                    │  - name          │  sessions, and PRs)
                    │  - description   │
                    │  - difficulty    │
                    │  - muscleGroup   │──────┐
                    │  - type          │      │ N:M
                    └──────────────────┘      │
                                              │
                    ┌──────────────────┐      │
                    │      Tag         │◀─────┘
                    │  - name          │ (via exercise_tags junction)
                    │  - color         │
                    └──────────────────┘
```

---

## 2. Core Entities

| Entity              | Description                                    |
|---------------------|------------------------------------------------|
| **User**            | App user with email, name, age, role, profile  |
| **Exercise**        | Exercise definition (admin-managed catalog)    |
| **Tag**             | Labels for exercises (admin-managed)           |
| **WorkoutTemplate** | Reusable workout plan with exercises + sets    |
| **WorkoutSession**  | Actual workout log (can be from template)      |
| **SessionExercise** | Exercise performed in a session                |
| **SessionSet**      | Individual set within a session exercise       |
| **PersonalRecord**  | User's best performance per exercise           |
