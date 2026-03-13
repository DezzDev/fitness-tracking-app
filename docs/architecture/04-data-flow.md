# Data Flow

## 1. Authentication Flow

```
┌───────────┐     POST /api/users/login     ┌──────────┐
│ Frontend  │ ──────────────────────────▶   │ Backend  │
│           │                               │          │
│           │   { user, accessToken }       │          │
│           │ ◀──────────────────────────   │          │
│           │                               └──────────┘
│           │
│  1. Store token in localStorage
│  2. Store user in localStorage
│  3. Update Zustand authStore
│  4. Redirect to /dashboard
│           │
│  Subsequent requests:
│  Axios interceptor adds
│  Authorization: Bearer <token>
└──────────┘
```

---

## 2. Data Query Flow (React Query)

```
Component
    │
    ├── useWorkoutTemplates()     ← Custom hook
    │       │
    │       ├── useQuery({
    │       │     queryKey: queryKeys.workouts(filters),
    │       │     queryFn: () => workoutTemplatesApi.list(filters)
    │       │   })
    │       │
    │       └── useMutation({
    │             mutationFn: workoutTemplatesApi.create,
    │             onSuccess: () => queryClient.invalidateQueries(...)
    │           })
    │
    └── Renders data / loading / error states
```

---

## 3. Workout Session from Template

```
1. User selects a template on DashboardPage (EntryScreen)
2. POST /api/workoutSessions/from-template { templateId, sessionDate }
3. Backend creates session with exercises copied from template
4. Frontend renders ActiveSession with exercise list and set tracking
5. User completes sets, updates tracked via PATCH /api/workoutSessions/:id
6. On completion, CompletionScreen shows summary
```
