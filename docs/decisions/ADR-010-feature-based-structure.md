# ADR-010: Feature-Based Frontend Structure

**Status**: Accepted  
**Date**: 2025-01-01  
**Scope**: Frontend

## Context

As a frontend application grows, it needs a directory structure that scales. The two dominant patterns are:

- **Type-based**: Group by file type (`components/`, `hooks/`, `pages/`, `schemas/` at root level)
- **Feature-based**: Group by domain (`features/auth/`, `features/workouts/`, etc.), each with its own components, hooks, pages, and schemas

## Decision

Use a **feature-based module structure** under `frontend/src/features/`. Each feature is a self-contained module:

```
features/<feature>/
├── pages/          # Page-level components (mapped to routes)
├── components/     # Feature-specific UI components
├── hooks/          # React Query hooks (useQuery/useMutation wrappers)
└── schemas/        # Zod form validation schemas
```

Current features: `auth`, `dashboard`, `exercises`, `workouts`, `profile`, `templates` (planned).

Shared code lives outside `features/`:
- `components/ui/` -- shadcn/ui components
- `components/layouts/` -- layout wrappers
- `hooks/` -- shared hooks (e.g., `useUnsavedChanges`)
- `api/` -- Axios client and endpoint modules
- `store/` -- Zustand auth store
- `lib/` -- utilities and React Query config
- `types/` -- shared domain types

## Consequences

### Positive

- **Colocation**: Related code lives together. `WorkoutForm.tsx`, `useWorkoutTemplates.ts`, and `workoutSchemas.ts` are in the same directory tree, not scattered across global folders.
- **Scalability**: New features are added as new directories without touching existing ones.
- **Clear boundaries**: It is obvious which components belong to which domain.
- **Reduced coupling**: Features import from shared code (`api/`, `components/ui/`, `lib/`) but not from each other.

### Negative

- **Shared code gray area**: When a component is used by two features, it must be promoted to the shared `components/` directory. This boundary is not enforced by tooling.
- **Small features feel heavy**: A feature with a single page still gets its own directory tree (e.g., `auth` has only `LoginPage`, `RegisterPage`, and one schema file).
- **Not all features are equal**: `workouts` has 7 components, 3 hooks, and 2 schemas; `dashboard` has 3 components and no hooks. The structure accommodates both but the smaller ones feel over-organized.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Type-based (`components/`, `hooks/`, `pages/` at root) | Does not scale; related files are spread across the tree; harder to reason about feature boundaries |
| Atomic design (atoms/molecules/organisms/templates/pages) | UI-component focused; does not account for hooks, schemas, or feature-specific logic |
| Route-based (`routes/<path>/`) | Couples directory structure to URL paths; breaks when routes change |

## References

- Feature structure: `docs/architecture/03-frontend.md` (section 1, 6)
- Feature module pattern: `docs/architecture/03-frontend.md` (section 6)
