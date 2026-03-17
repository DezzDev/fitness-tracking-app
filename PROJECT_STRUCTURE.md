# Project Structure - Fitness Tracker App

``` bash
fitness-tracker-app/
├── backend/                      # Backend (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/               # Configuration
│   │   │   ├── database.ts       # Database connection
│   │   │   └── env.ts            # Environment variables
│   │   ├── controllers/          # HTTP controllers
│   │   │   ├── exercise.controller.ts
│   │   │   ├── personalRecord.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── workoutSession.controller.ts
│   │   │   └── workoutTemplate.controller.ts
│   │   ├── middlewares/          # Express middlewares
│   │   │   ├── auth.middleware.ts
│   │   │   ├── authorize.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── validate.middleware.ts
│   │   ├── repositories/        # Data access layer
│   │   │   ├── exercise.repository.ts
│   │   │   ├── personalRecord.repository.ts
│   │   │   ├── user.repository.ts
│   │   │   ├── workoutSession.repository.ts
│   │   │   └── workoutTemplate.repository.ts
│   │   ├── routes/               # API routes
│   │   │   ├── exercise.routes.ts
│   │   │   ├── personalRecord.routes.ts
│   │   │   ├── tag.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── workoutSession.routes.ts
│   │   │   └── workoutTemplate.routes.ts
│   │   ├── schemas/              # Zod validation schemas
│   │   │   ├── exercise.schema.ts
│   │   │   ├── personalRecord.schema.ts
│   │   │   ├── user.schema.ts
│   │   │   ├── workoutSession.schema.ts
│   │   │   └── workoutTemplate.schema.ts
│   │   ├── services/            # Business logic
│   │   │   ├── exercise.service.ts
│   │   │   ├── personalRecord.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── workoutSession.service.ts
│   │   │   └── workoutTemplate.service.ts
│   │   ├── test-utils/           # Testing utilities
│   │   │   ├── fixtures.ts
│   │   │   ├── helpers.ts
│   │   │   └── setup.ts
│   │   ├── types/                # TypeScript types
│   │   │   ├── common/           # Shared types
│   │   │   │   ├── common.types.ts
│   │   │   │   ├── database.types.ts
│   │   │   │   └── error.types.ts
│   │   │   └── entities/         # Entity types
│   │   │       ├── exercise.types.ts
│   │   │       ├── personalRecord.type.ts
│   │   │       ├── user.types.ts
│   │   │       ├── workoutSession.type.ts
│   │   │       └── workoutTemplate.types.ts
│   │   ├── utils/                # Utilities
│   │   │   ├── castRows.utils.ts
│   │   │   ├── error.utils.ts
│   │   │   ├── jwt.utils.ts
│   │   │   ├── logger.ts
│   │   │   └── response.ts
│   │   ├── __tests__/            # Tests
│   │   │   ├── e2e/
│   │   │   │   └── user-flow.test.ts
│   │   │   ├── integration/
│   │   │   │   ├── auth.test.ts
│   │   │   │   └── users.test.ts
│   │   │   └── unit/
│   │   │       ├── repositories/
│   │   │       │   └── user.repository.test.ts
│   │   │       ├── services/
│   │   │       │   └── user.service.test.ts
│   │   │       └── utils/
│   │   │           └── jwt.utils.test.ts
│   │   ├── script/               # Scripts
│   │   │   └── seeding.data.ts
│   │   └── index.ts              # Entry point
│   ├── jest.teardown.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                     # Frontend (Vite + React + TypeScript)
│   ├── src/
│   │   ├── api/                  # API client
│   │   │   ├── client.ts         # Axios instance
│   │   │   └── endpoints/        # API endpoints
│   │   │       ├── auth.ts
│   │   │       ├── exercises.ts
│   │   │       ├── users.ts
│   │   │       ├── workouts.ts
│   │   │       ├── workoutSessions.ts
│   │   │       └── workoutTemplates.ts
│   │   ├── components/           # Shared components
│   │   │   ├── layouts/          # Layout components
│   │   │   │   ├── AuthLayout.tsx
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   └── RootLayout.tsx
│   │   │   └── ui/               # UI components (shadcn/ui)
│   │   │       ├── alert.tsx
│   │   │       ├── avatar.tsx
│   │   │       ├── badge.tsx
│   │   │       ├── button.tsx
│   │   │       ├── calendar.tsx
│   │   │       ├── card.tsx
│   │   │       ├── command.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── dropdown-menu.tsx
│   │   │       ├── form.tsx
│   │   │       ├── input.tsx
│   │   │       ├── label.tsx
│   │   │       ├── popover.tsx
│   │   │       ├── select.tsx
│   │   │       ├── separator.tsx
│   │   │       ├── skeleton.tsx
│   │   │       ├── sonner.tsx
│   │   │       ├── switch.tsx
│   │   │       ├── table.tsx
│   │   │       ├── tabs.tsx
│   │   │       ├── textarea.tsx
│   │   │       └── tooltip.tsx
│   │   ├── features/             # Feature-based modules
│   │   │   ├── auth/             # Authentication
│   │   │   │   ├── pages/
│   │   │   │   │   ├── LoginPage.tsx
│   │   │   │   │   └── RegisterPage.tsx
│   │   │   │   └── schemas/
│   │   │   │       └── authSchemas.ts
│   │   │   ├── dashboard/        # Dashboard
│   │   │   │   └── pages/
│   │   │   │       └── DashboardPage.tsx
│   │   │   ├── exercises/        # Exercises feature
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useExercises.ts
│   │   │   │   └── pages/
│   │   │   │       └── ExercisesPage.tsx
│   │   │   ├── profile/          # User profile
│   │   │   │   ├── components/
│   │   │   │   │   ├── AccountSettings.tsx
│   │   │   │   │   ├── ChangePasswordForm.tsx
│   │   │   │   │   ├── EditProfileForm.tsx
│   │   │   │   │   └── ProfileImageUpload.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useProfile.ts
│   │   │   │   └── pages/
│   │   │   │       └── ProfilePage.tsx
│   │   │   └── workouts/         # Workouts feature
│   │   │       ├── components/
│   │   │       │   ├── ExerciseInfo.tsx
│   │   │       │   ├── ExerciseSelector.tsx
│   │   │       │   ├── SessionsList.tsx
│   │   │       │   ├── SetList.tsx
│   │   │       │   ├── TemplatesList.tsx
│   │   │       │   ├── WorkoutCard.tsx
│   │   │       │   └── WorkoutForm.tsx
│   │   │       ├── hooks/
│   │   │       │   ├── useWorkouts.ts
│   │   │       │   ├── useWorkoutSessions.ts
│   │   │       │   └── useWorkoutTemplates.ts
│   │   │       ├── pages/
│   │   │       │   ├── CreateWorkoutPage.tsx
│   │   │       │   ├── EditWorkoutPage.tsx
│   │   │       │   ├── WorkoutDetailPage.tsx
│   │   │       │   └── WorkoutsPage.tsx
│   │   │       └── schemas/
│   │   │           ├── templateSchema.ts
│   │   │           └── workoutSchemas.ts
│   │   ├── hooks/                # Shared hooks
│   │   │   └── useUnsavedChanges.ts
│   │   ├── lib/                  # Libraries
│   │   │   ├── queryClient.ts    # React Query client
│   │   │   └── utils.ts           # Utility functions
│   │   ├── pages/                # Pages
│   │   │   └── NotFoundPage.tsx
│   │   ├── routes/               # Routing
│   │   │   ├── index.tsx         # Route definitions
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── PublicRoute.tsx
│   │   ├── store/                # State management (Zustand)
│   │   │   └── authStore.ts
│   │   ├── types/                # TypeScript types
│   │   │   └── index.ts
│   │   ├── App.tsx               # Root component
│   │   └── main.tsx              # Entry point
│   ├── components.json
│   ├── package.json
│   └── vite.config.ts
│
├── .agents/                      # Agent skills
├── documents/                    # Documentation
├── API_ENDPOINTS.md              # API documentation
├── AGENTS.md                     # Agent guidelines
└── README.md                     # Project readme
```

## Architecture Overview

### Backend (Layered Architecture)

``` bash
Request → Routes → Controllers → Services → Repositories → Database
                ↓              ↓           ↓            ↓
            Middlewares    Validation  Business     Data Access
                           Schemas     Logic
```

- **Routes**: Define API endpoints and HTTP methods
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic implementation
- **Repositories**: Data access abstraction
- **Schemas**: Zod validation schemas
- **Middlewares**: Auth, validation, error handling
- **Types**: TypeScript type definitions

### Frontend (Feature-Based Architecture)

``` bash
src/
├── api/          # API communication layer
├── components/  # Shared UI components
├── features/    # Feature modules (auth, dashboard, exercises, profile, workouts)
├── hooks/       # Shared custom hooks
├── lib/         # Libraries (React Query, utilities)
├── pages/       # Page components
├── routes/      # Routing configuration
├── store/       # Zustand state management
└── types/       # TypeScript types
```
