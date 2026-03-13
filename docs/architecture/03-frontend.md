# Frontend Architecture

## 1. Directory Structure

```
frontend/src/
├── main.tsx                    # React root render (StrictMode)
├── App.tsx                     # QueryClientProvider + RouterProvider
├── index.css                   # Global styles (Tailwind CSS v4)
├── api/
│   ├── client.ts               # Axios instance + interceptors
│   └── endpoints/
│       ├── auth.ts             # Login, register, logout, token management
│       ├── exercises.ts        # Exercise CRUD + stats
│       ├── users.ts            # User profile, update
│       ├── workouts.ts         # (Deprecated) legacy workout endpoints
│       ├── workoutTemplates.ts # Template CRUD + favorites + duplicate
│       └── workoutSessions.ts  # Session CRUD + stats + from-template
├── store/
│   └── authStore.ts            # Zustand store (auth state + actions)
├── lib/
│   ├── queryClient.ts          # React Query client + centralized query keys
│   └── utils.ts                # cn() utility (clsx + tailwind-merge)
├── routes/
│   ├── index.tsx               # Router definition (createBrowserRouter)
│   ├── ProtectedRoute.tsx      # Auth guard → redirects to /login
│   └── PublicRoute.tsx         # Guest guard → redirects to /dashboard
├── components/
│   ├── layouts/
│   │   ├── RootLayout.tsx      # Top-level layout (Toaster + loadUser)
│   │   ├── DashboardLayout.tsx # Sidebar + header + main content area
│   │   └── AuthLayout.tsx      # Layout for auth pages
│   └── ui/                     # shadcn/ui components (22 components)
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── ... (and more)
│       └── sonner.tsx
├── features/
│   ├── auth/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   └── schemas/
│   │       └── authSchemas.ts
│   ├── dashboard/
│   │   ├── pages/
│   │   │   └── DashboardPage.tsx
│   │   └── components/
│   │       ├── EntryScreen.tsx
│   │       ├── ActiveSession.tsx
│   │       └── CompletionScreen.tsx
│   ├── exercises/
│   │   ├── pages/
│   │   │   └── ExercisesPage.tsx
│   │   ├── components/
│   │   │   ├── ExerciseCard.tsx
│   │   │   ├── ExerciseDetailDialog.tsx
│   │   │   ├── ExerciseFiltersBar.tsx
│   │   │   ├── ExerciseStatsBar.tsx
│   │   │   └── Pagination.tsx
│   │   └── hooks/
│   │       └── useExercises.ts
│   ├── workouts/
│   │   ├── pages/
│   │   │   ├── WorkoutsPage.tsx
│   │   │   ├── CreateWorkoutPage.tsx
│   │   │   ├── EditWorkoutPage.tsx
│   │   │   ├── SessionDetailPage.tsx
│   │   │   └── TemplateDetailPage.tsx
│   │   ├── components/
│   │   │   ├── WorkoutForm.tsx
│   │   │   ├── WorkoutCard.tsx
│   │   │   ├── TemplatesList.tsx
│   │   │   ├── SessionsList.tsx
│   │   │   ├── ExerciseSelector.tsx
│   │   │   ├── ExerciseInfo.tsx
│   │   │   └── SetList.tsx
│   │   ├── hooks/
│   │   │   ├── useWorkouts.ts
│   │   │   ├── useWorkoutTemplates.ts
│   │   │   └── useWorkoutSessions.ts
│   │   └── schemas/
│   │       ├── workoutSchemas.ts
│   │       └── templateSchema.ts
│   ├── profile/
│   │   ├── pages/
│   │   │   └── ProfilePage.tsx
│   │   ├── components/
│   │   │   ├── EditProfileForm.tsx
│   │   │   ├── ChangePasswordForm.tsx
│   │   │   ├── ProfileImageUpload.tsx
│   │   │   └── AccountSettings.tsx
│   │   └── hooks/
│   │       └── useProfile.ts
│   └── templates/                # (Empty -- planned feature module)
├── pages/
│   └── NotFoundPage.tsx          # 404 page
├── hooks/
│   └── useUnsavedChanges.ts      # Shared hook for unsaved changes warning
├── types/
│   └── index.ts                  # Frontend domain types
└── assets/                       # Static assets
```

---

## 2. Application Bootstrap

```
main.tsx
  └── <StrictMode>
        └── <App />
              ├── <QueryClientProvider>    ← React Query v5
              │     ├── <RouterProvider>   ← React Router v7
              │     └── <ReactQueryDevtools>
              └── Router Tree:
                    └── RootLayout (loads user from localStorage, renders Toaster)
                          ├── PublicRoute → LoginPage, RegisterPage
                          └── ProtectedRoute → DashboardLayout
                                ├── DashboardPage
                                ├── WorkoutsPage
                                ├── CreateWorkoutPage
                                ├── EditWorkoutPage
                                ├── SessionDetailPage
                                ├── TemplateDetailPage
                                ├── ExercisesPage
                                └── ProfilePage
```

---

## 3. State Management

The frontend uses a **dual state management** approach:

**Client State -- Zustand v5** (`store/authStore.ts`):
- Authentication state: `user`, `isAuthenticated`, `isLoading`, `error`
- Actions: `login()`, `register()`, `logout()`, `loadUser()`, `clearError()`
- Persists token and user data in `localStorage`

**Server State -- React Query v5** (`lib/queryClient.ts`):
- Stale time: 5 minutes
- GC time: 10 minutes
- Retry: 2 for queries, 0 for mutations
- Centralized query keys in `queryKeys` object for cache management
- Custom hooks in each feature module wrap `useQuery`/`useMutation`

---

## 4. API Layer

**Axios Client** (`api/client.ts`):
- Base URL: `VITE_API_URL` or `http://localhost:3000/api`
- 10-second timeout
- Request interceptor: attaches JWT from `localStorage`
- Response interceptor: auto-logout on 401 (except for auth-related routes)

**Endpoint Modules** (`api/endpoints/*.ts`):
- `auth.ts` -- login, register, logout, getCurrentUser, isAuthenticated
- `exercises.ts` -- list, get, stats with filters
- `users.ts` -- profile operations
- `workoutTemplates.ts` -- CRUD, duplicate, favorites, today's schedule
- `workoutSessions.ts` -- CRUD, stats, from-template, recent, date-range
- `workouts.ts` -- (deprecated) legacy endpoints

---

## 5. Routing

Built with React Router v7 using `createBrowserRouter`:

| Path                          | Guard     | Component            |
|-------------------------------|-----------|----------------------|
| `/`                           | --        | Redirect to `/dashboard` |
| `/login`                      | Public    | LoginPage            |
| `/register`                   | Public    | RegisterPage         |
| `/dashboard`                  | Protected | DashboardPage        |
| `/workouts`                   | Protected | WorkoutsPage         |
| `/workouts/templates/new`     | Protected | CreateWorkoutPage    |
| `/workouts/templates/:id`     | Protected | TemplateDetailPage   |
| `/workouts/sessions/:id`      | Protected | SessionDetailPage    |
| `/workouts/:id/edit`          | Protected | EditWorkoutPage      |
| `/exercises`                  | Protected | ExercisesPage        |
| `/profile`                    | Protected | ProfilePage          |
| `*`                           | --        | NotFoundPage         |

- **ProtectedRoute**: checks `useAuthStore.isAuthenticated`, redirects to `/login` if false
- **PublicRoute**: redirects authenticated users to `/dashboard`

---

## 6. Feature Module Pattern

Each feature follows a consistent structure:

```
features/<feature>/
├── pages/          # Page-level components (routed)
├── components/     # Feature-specific UI components
├── hooks/          # React Query hooks (useQuery/useMutation wrappers)
└── schemas/        # Zod form validation schemas
```

Features:
- **auth** -- Login and registration with form validation
- **dashboard** -- Main dashboard with entry screen, active session tracking, completion screen
- **exercises** -- Exercise catalog with filtering, search, stats, detail dialogs
- **workouts** -- Template + session management (CRUD, duplicate, start from template)
- **profile** -- User profile editing, password change, image upload, account settings
- **templates** -- (Planned, currently empty)

---

## 7. UI Component Library

- **shadcn/ui** (New York style) -- 22 components built on Radix UI primitives
- **Tailwind CSS v4** -- utility-first styling with CSS variables for theming
- **Lucide React** -- icon library
- **Sonner** -- toast notifications
- **React Hook Form + Zod** -- form state management with schema validation
- **React Day Picker** -- date selection (calendar component)
- **cmdk** -- command palette component
