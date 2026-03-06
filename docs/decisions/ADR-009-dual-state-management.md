# ADR-009: Dual State Management (Zustand + React Query)

**Status**: Accepted  
**Date**: 2025-01-01  
**Scope**: Frontend

## Context

The frontend needs to manage two categories of state:

- **Client state**: Authentication status, UI preferences -- data that originates and lives in the browser
- **Server state**: Exercises, workout templates, sessions, user profile -- data fetched from the API that needs caching, revalidation, and synchronization

Using a single state management solution for both categories leads to either over-engineering (putting server cache in Redux/Zustand) or under-engineering (manual fetch-and-setState without caching).

## Decision

Use a **dual state management** approach:

| Category | Library | Store |
|----------|---------|-------|
| Client state | **Zustand v5** | `store/authStore.ts` -- `user`, `isAuthenticated`, `isLoading`, `error` |
| Server state | **React Query v5** | `lib/queryClient.ts` -- centralized `queryKeys`, custom hooks per feature |

### Zustand Configuration

- Single store for auth: `login()`, `register()`, `logout()`, `loadUser()`, `clearError()`
- Persists token and user data in `localStorage`
- No middleware (no `persist`, `devtools`, or `immer`)

### React Query Configuration

| Setting | Value |
|---------|-------|
| Stale time | 5 minutes |
| GC time | 10 minutes |
| Query retries | 2 |
| Mutation retries | 0 |
| Query keys | Centralized in `queryKeys` object |

Custom hooks in each feature module wrap `useQuery`/`useMutation` (e.g., `useWorkoutTemplates()`, `useExercises()`).

## Consequences

### Positive

- **Separation of concerns**: Auth state is synchronous and local; server data is async with caching. Each library excels at its category.
- **Automatic caching**: React Query handles cache invalidation, background refetching, stale-while-revalidate, and garbage collection
- **Minimal boilerplate**: Zustand requires no providers, reducers, or actions; React Query's `useQuery`/`useMutation` replace manual `useEffect` + `useState` fetch patterns
- **Centralized cache keys**: `queryKeys` object prevents key collisions and enables targeted invalidation after mutations

### Negative

- **Two mental models**: Developers must understand both Zustand's synchronous store pattern and React Query's async cache pattern
- **Auth state duplication**: User data exists in both Zustand (for immediate access) and could be cached in React Query (for the `/users/me` endpoint). Currently only Zustand holds it.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Redux Toolkit + RTK Query | Heavier; RTK Query is capable but Redux adds ceremony for simple auth state |
| Zustand for everything | Zustand is not designed for server state caching (stale-while-revalidate, background refetch, GC) |
| React Query for everything | React Query is not ideal for synchronous client-only state like auth flags |
| Jotai / Recoil | Atomic state model is more complex than needed for a single auth store |
| Context API | Re-renders all consumers on any state change; not suitable for frequent updates |

## References

- Zustand store: `frontend/src/store/authStore.ts`
- React Query config: `frontend/src/lib/queryClient.ts`
- Feature hooks: `frontend/src/features/*/hooks/`
- Data flow: `docs/architecture/04-data-flow.md` (section 2)
