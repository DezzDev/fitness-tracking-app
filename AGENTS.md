# AGENTS.md - Fitness Tracker App

Guidelines for agentic coding agents working on this repository.

## Project Overview

Full-stack fitness tracking application:
- **Backend**: Node.js + Express 5 + TypeScript (in `/backend`)
- **Frontend**: Vite 7 + React 19 + TypeScript (in `/frontend`)
- **Package manager**: pnpm (both projects are independent -- no monorepo root)
- **Database**: Turso (cloud LibSQL/SQLite) via `@libsql/client` -- raw SQL, no ORM

---

## Commands

### Backend (run from `/backend`)

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start dev server (ts-node-dev with hot reload) |
| `pnpm run build` | Compile TypeScript (`tsc`) to `/dist` |
| `pnpm run start` | Run compiled production build (`node dist/index.js`) |
| `pnpm run test` | Run all tests (Jest) |
| `pnpm run test:unit` | Run unit tests only (`__tests__/unit/`) |
| `pnpm run test:integration` | Run integration tests only (`__tests__/integration/`) |
| `pnpm run test:e2e` | Run e2e tests only (`__tests__/e2e/`) |
| `pnpm run test:coverage` | Run tests with coverage (threshold: 70% all metrics) |
| `pnpm run seed` | Run database seeding script |

**Run a single test file or test name:**
```bash
pnpm test -- --testPathPatterns=user.service.test.ts
pnpm test -- --testNamePattern="should create user"
```

**Lint & type-check backend:**
```bash
cd backend && npx eslint . && pnpm run build
```

### Frontend (run from `/frontend`)

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start Vite dev server |
| `pnpm run build` | TypeScript check (`tsc -b`) + Vite build |
| `pnpm run lint` | Run ESLint |
| `pnpm run preview` | Preview production build |

---

## Code Style

### TypeScript

- **Strict mode** enabled on both backend and frontend
- Use explicit types; avoid `any`
- `strictNullChecks` enabled -- always handle null/undefined
- `noUncheckedIndexedAccess` enabled (backend) -- array/index access returns `T | undefined`
- No Prettier -- formatting enforced via ESLint rules only

### Formatting

- **Semicolons**: Required (ESLint `semi: ["error", "always"]` in backend)
- **Quotes**: Single quotes preferred
- **Indentation**: 2 spaces (tabs in some middleware files -- match existing style)
- **Max line length**: 100 characters (soft limit)

### Imports & Path Aliases

Both projects use `@/` alias mapped to `src/`:
```typescript
import { UserService } from '@/services/user.service';      // Backend
import { Button } from '@/components/ui/button';             // Frontend
```
**Exception**: Test files use relative imports (not `@/`).

### Naming Conventions

- **Files**: dot-separated kebab-case (`user.service.ts`, `error.middleware.ts`, `common.types.ts`)
- **Types/Interfaces**: PascalCase (`AppError`, `UserCreateData`, `ApiResponse`)
- **Variables/Functions**: camelCase (`getUserById`, `handleServiceError`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRIES`, `SALT_ROUNDS`)
- **Enums**: PascalCase names and keys (`NodeEnv.Development`, `LogLevel.Info`)
- **Services**: Exported as object literals, not classes (`export const userService = { ... }`)

### Error Handling (Backend)

1. **Controllers**: Wrap handlers with `asyncHandler()` from `error.middleware.ts`
2. **Services**: Throw `AppError` via `createAppError(message, statusCode)` for business errors; catch blocks use `handleServiceError()` to normalize and re-throw
3. **Validation**: Zod v4 schemas validated by `validateBody`/`validateParams`/`validateQuery` middleware; validated data lives on `req.validatedBody`, `req.validatedParams`, `req.validatedQuery`
4. **Centralized handler**: `errorHandler` middleware catches all errors, returns consistent JSON via `ResponseHandler.error()`

### Response Pattern (Backend)

All controllers use `ResponseHandler` from `src/utils/response.ts`:
```typescript
ResponseHandler.success(res, data, 'message');   // 200
ResponseHandler.created(res, data, 'message');   // 201
ResponseHandler.noContent(res);                  // 204
```
Response shape: `{ success: true, message: string, data: T, timestamp: string }`

---

## Architecture

### Backend (Layered)

```
routes/         -> Express routers: validation -> auth -> authorization -> controller
controllers/    -> Thin HTTP layer: extract validated data, call service, return response
services/       -> Business logic: throw AppError, use handleServiceError in catch
repositories/   -> Raw SQL via LibSQL client, map snake_case rows to camelCase objects
schemas/        -> Zod v4 validation schemas (infer types with z.infer<>)
middlewares/    -> auth (JWT), authorize (role), validate (Zod), error (centralized)
types/          -> Domain types organized in common/ and entities/ subdirs
utils/          -> jwt, logger, response handler, error utilities, row casting
config/         -> Database connection (retry/health-check), Zod-validated env vars
```

### Frontend (Feature-Based)

```
features/       -> Feature modules with pages/, components/, hooks/, schemas/
api/            -> Axios client (interceptors, auth token) + endpoint modules
store/          -> Zustand (auth state: login, register, logout, loadUser)
components/ui/  -> shadcn/ui (new-york style, Radix primitives, Tailwind CSS v4)
routes/         -> React Router v7 with ProtectedRoute/PublicRoute guards
lib/            -> React Query config (queryClient, centralized query keys), cn() utility
hooks/          -> Shared custom hooks
types/          -> Frontend domain interfaces
```

Key libraries: React Query v5 (server state), Zustand v5 (client state), React Hook Form + Zod (forms), Sonner (toasts), Lucide (icons), Tailwind CSS v4.

---

## Testing

- Tests live in `backend/src/__tests__/` organized as `unit/`, `integration/`, `e2e/`
- Test files: `*.test.ts`
- Framework: Jest 30 with ts-jest, 10s timeout, verbose output
- Mocking: `jest-mock-extended`; unit tests use `jest.mock()` with `jest.Mocked<typeof ...>`
- Test utilities: `src/test-utils/` (setup.ts, helpers.ts, fixtures.ts)
- Setup sets `NODE_ENV=test`, `JWT_SECRET=test-secret`, `LOG_LEVEL=error`
- Global teardown cleans mock users (`email LIKE 'mocked-%'`) from the database
- Imports: Use `@jest/globals` for `describe`, `it`, `expect`, `jest`, `beforeEach`

### ESLint

- **Backend**: ESLint 9 flat config with `typescript-eslint` strict + stylistic presets
- **Frontend**: ESLint 9 flat config with `react-hooks` + `react-refresh` plugins

---

## Database

- **Turso** (cloud LibSQL/SQLite) via `@libsql/client`
- Config: `backend/src/config/database.ts` (connection retry, query retry, health checks)
- Env vars: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (validated by Zod at startup)
- Migrations: Managed manually (see `documents/database/`)
- Repositories use parameterized SQL with UUID primary keys

---

## Key Files

| File | Purpose |
|------|---------|
| `backend/src/index.ts` | Express app setup, middleware stack, route mounting |
| `frontend/src/main.tsx` | React root render |
| `frontend/src/App.tsx` | QueryClientProvider + RouterProvider |
| `backend/src/middlewares/auth.middleware.ts` | JWT authentication (required/optional) |
| `backend/src/middlewares/error.middleware.ts` | `createAppError`, `asyncHandler`, `errorHandler` |
| `backend/src/utils/response.ts` | `ResponseHandler` (success/created/noContent/error) |
| `backend/src/config/env.ts` | Zod-validated environment variables |
| `frontend/src/api/client.ts` | Axios instance with auth interceptors |
| `frontend/src/store/authStore.ts` | Zustand auth store |
| `frontend/src/lib/queryClient.ts` | React Query client + query key registry |


## Backend endpoints
# API Endpoints

Base URL: `http://localhost:3000/api`

---

## Authentication

All endpoints (except `/users/register` and `/users/login`) require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Headers

| Header | Value |
|--------|-------|
| Content-Type | application/json |
| Authorization | Bearer \<token\> |

---

## Users

### Register

**POST** `/users/register`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

---

### Login

**POST** `/users/login`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "timestamp": "2025-03-03T12:00:00.000Z"
}
```

---

### Get Profile

**GET** `/users/me`

Requires authentication.

Response:
```json
{
  "success": true,
  "message": "User profile retrieved",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "age": 30,
    "role": "user",
    "profileImage": "https://...",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-03-03T12:00:00.000Z"
  },
  "timestamp": "2025-03-03T12:00:00.000Z"
}
```

---

### Update User

**PATCH** `/users/:id`

Requires authentication.

Request:
```json
{
  "name": "John Updated",
  "age": 31,
  "profileImage": "https://..."
}
```

---

### Change Password

**PATCH** `/users/me/password`

Requires authentication.

Request:
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

---

### List Users (Admin)

**GET** `/users`

Requires admin authentication.

Query parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |

---

### Get User (Admin)

**GET** `/users/:id`

Requires admin authentication.

---

### Delete User (Admin)

**DELETE** `/users/softDelete/:id` or `/users/hardDelete/:id`

Requires admin authentication.

---

## Exercises

### Get Exercise Stats

**GET** `/exercises/stats`

No authentication required.

Response:
```json
{
  "success": true,
  "message": "Exercise stats retrieved",
  "data": {
    "total": 50,
    "byDifficulty": { "beginner": 10, "intermediate": 30, "advanced": 10 },
    "byType": { "strength": 40, "endurance": 10 },
    "byMuscleGroup": { "chest": 15, "back": 15, "legs": 20 }
  },
 2025-03-03T12 "timestamp": ":00:00.000Z"
}
```

---

### List Exercises

**GET** `/exercises`

No authentication required.

Query parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |
| search | string | Search by name |
| tagId | string | Filter by tag UUID |
| muscleGroup | string | Filter by muscle group |

Response:
```json
{
  "success": true,
  "message": "Exercises retrieved",
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Bench Press",
        "description": "Chest exercise",
        "difficulty": "intermediate",
        "muscleGroup": "chest",
        "type": "strength",
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "totalPages": 3
  },
  "timestamp": "2025-03-03T12:00:00.000Z"
}
```

---

### Get Exercise

**GET** `/exercises/:id`

No authentication required.

Response:
```json
{
  "success": true,
  "message": "Exercise retrieved",
  "data": {
    "id": "uuid",
    "name": "Bench Press",
    "description": "Chest exercise",
    "difficulty": "intermediate",
    "muscleGroup": "chest",
    "type": "strength",
    "tags": [
      { "id": "uuid", "name": "compound" }
    ],
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": "2025-03-03T12:00:00.000Z"
}
```

---

### Create Exercise

**POST** `/exercises`

Requires admin authentication.

Request:
```json
{
  "name": "Bench Press",
  "description": "Chest exercise",
  "difficulty": "intermediate",
  "muscleGroup": "chest",
  "type": "strength",
  "tagIds": ["uuid1", "uuid2"]
}
```

---

### Update Exercise

**PATCH** `/exercises/:id`

Requires admin authentication.

Request:
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

---

### Delete Exercise

**DELETE** `/exercises/:id`

Requires admin authentication.

---

## Tags

### List Tags

**GET** `/tags`

No authentication required.

Response:
```json
{
  "success": true,
  "message": "Tags retrieved",
  "data": [
    { "id": "uuid", "name": "strength", "color": "#FF5733" }
  ],
  "timestamp": "2025-03-03T12:00:00.000Z"
}
```

---

### Get Tag

**GET** `/tags/:id`

No authentication required.

---

### Create Tag

**POST** `/tags`

Requires admin authentication.

Request:
```json
{
  "name": "strength",
  "color": "#FF5733"
}
```

---

### Delete Tag

**DELETE** `/tags/:id`

Requires admin authentication.

---

## Personal Records

All endpoints require authentication.

### Get PR Stats

**GET** `/personal-records/stats`

Response:
```json
{
  "success": true,
  "message": "Personal record stats retrieved",
  "data": {
    "totalPRs": 25,
    "byType": { "weight": 20, "reps": 5 },
    "recentPRs": [
      {
        "id": "uuid",
        "exerciseId": "uuid",
        "exerciseName": "Bench Press",
        "type": "weight",
        "value": 100,
        "achievedAt": "2025-03-01T00:00:00.000Z"
      }
    ]
  },
  "timestamp": "2025-03-03T12:00:00.000Z"
}
```

---

### Create/Update PR

**POST** `/personal-records`

Request:
```json
{
  "exerciseId": "uuid",
  "type": "weight",
  "value": 100,
  "reps": 5,
  "sessionId": "uuid"
}
```

---

### List PRs

**GET** `/personal-records`

Requires authentication.

Query parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| exerciseId | string | Filter by exercise UUID |
| type | string | Filter by type (weight/reps/duration) |

---

### Get PRs by Exercise

**GET** `/personal-records/exercise/:exerciseId`

Requires authentication.

---

### Get PR

**GET** `/personal-records/:id`

Requires authentication.

---

### Update PR

**PATCH** `/personal-records/:id`

Requires authentication.

Request:
```json
{
  "value": 110,
  "reps": 5
}
```

---

### Delete PR

**DELETE** `/personal-records/:id`

Requires authentication.

---

## Workout Templates

All endpoints require authentication.

### Create Template

**POST** `/workoutTemplates`

Request:
```json
{
  "name": "Push Day",
  "description": "Chest, shoulders, triceps",
  "scheduledDayOfWeek": 1,
  "isFavorite": false,
  "exercises": [
    {
      "exerciseId": "uuid",
      "order": 1,
      "sets": [
        { "targetReps": 10, "targetWeight": 50, "order": 1 },
        { "targetReps": 10, "targetWeight": 50, "order": 2 },
        { "targetReps": 10, "targetWeight": 50, "order": 3 }
      ]
    }
  ]
}
```

---

### List Templates

**GET** `/workoutTemplates`

Requires authentication.

Query parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| search | string | Search by name |
| isFavorite | boolean | Filter favorites |
| scheduledDayOfWeek | number | Filter by day (0-6) |

Response:
```json
{
  "success": true,
  "message": "Templates retrieved",
  "data": {
    "items": [
      {
        "id": "uuid",
        "userId": "uuid",
        "name": "Push Day",
        "description": "Chest, shoulders, triceps",
        "scheduledDayOfWeek": 1,
        "isFavorite": false,
        "exercises": [...],
        "usageCount": 5,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-03-01T00:00:00.000Z"
      }
    ],
    "total": 10,
    "page": 1,
    "totalPages": 1
  },
  "timestamp": "2025-03-03T12:00:00.000Z"
}
```

---

### Get Today's Scheduled Template

**GET** `/workoutTemplates/today`

Requires authentication.

Response:
```json
{
  "success": true,
  "message": "Today's scheduled template retrieved",
  "data": {
    "id": "uuid",
    "name": "Push Day",
    ...
  },
  "timestamp": "2025-03-03T12:00:00.000Z"
}
```

---

### Get Template

**GET** `/workoutTemplates/:id`

Requires authentication.

Response:
```json
{
  "success": true,
  "message": "Template retrieved",
  "data": {
    "id": "uuid",
    "name": "Push Day",
    "description": "Chest, shoulders, triceps",
    "scheduledDayOfWeek": 1,
    "isFavorite": true,
    "exercises": [
      {
        "id": "uuid",
        "templateId": "uuid",
        "exerciseId": "uuid",
        "orderIndex": 1,
        "exercise": {
          "id": "uuid",
          "name": "Bench Press",
          "muscleGroup": "chest"
        },
        "suggestedSets": 3,
        "suggestedReps": 10
      }
    ],
    "usageCount": 5,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-03-01T00:00:00.000Z"
  },
  "timestamp": "2025-03-03T12:00:00.000Z"
}
```

---

### Update Template

**PATCH** `/workoutTemplates/:id`

Requires authentication.

Request:
```json
{
  "name": "Updated Push Day",
  "description": "Updated description",
  "isFavorite": true,
  "exercises": [...]
}
```

---

### Delete Template

**DELETE** `/workoutTemplates/:id`

Requires authentication.

---

### Duplicate Template

**POST** `/workoutTemplates/:id/duplicate`

Requires authentication.

Response:
```json
{
  "success": true,
  "message": "Template duplicated",
  "data": {
    "id": "new-uuid",
    "name": "Push Day (Copy)",
    ...
  },
  "timestamp": "2025-03-03T12:00:00.000Z"
}
```

---

### Toggle Favorite

**PATCH** `/workoutTemplates/:id/favorite`

Requires authentication.

Response:
```json
{
  "success": true,
  "message": "Favorite toggled",
  "data": {
    "id": "uuid",
    "isFavorite": true
  },
  "timestamp": "2025-03-03T12:00:00.000Z"
}
```

---

## Workout Sessions

All endpoints require authentication.

### Get Session Stats

**GET** `/workoutSessions/stats`

Response:
```json
{
  "success": true,
  "message": "Session stats retrieved",
  "data": {
    "totalSessions": 50,
    "totalDurationMinutes": 3000,
    "totalExercises": 200,
    "totalSets": 600,
    "averageDurationMinutes": 60,
    "sessionsThisWeek": 3,
    "sessionsThisMonth": 12,
    "favoriteTemplateId": "uuid"
  },
  "timestamp": "2025-03-03T12:00:00.000Z"
}
```

---

### Get Recent Sessions

**GET** `/workoutSessions/recent`

Query parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| limit | number | Number of sessions (default: 10) |

---

### Get Sessions by Date Range

**GET** `/workoutSessions/date-range`

Query parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | string | Start date (YYYY-MM-DD) |
| endDate | string | End date (YYYY-MM-DD) |

---

### Create Session from Template

**POST** `/workoutSessions/from-template`

Request:
```json
{
  "templateId": "uuid",
  "sessionDate": "2025-03-03"
}
```

Response:
```json
{
  "success": true,
  "message": "Session created from template",
  "data": {
    "id": "uuid",
    "title": "Push Day",
    "sessionDate": "2025-03-03",
    "templateId": "uuid",
    "templateName": "Push Day",
    "exercises": [...],
    "createdAt": "2025-03-03T12:00:00.000Z"
  },
  "timestamp": "2025-03-03T12:00:00.000Z"
}
```

---

### Create Session

**POST** `/workoutSessions`

Request:
```json
{
  "title": "Push Day",
  "sessionDate": "2025-03-03",
  "duration": 60,
  "notes": "Good workout",
  "templateId": "uuid",
  "exercises": [
    {
      "exerciseId": "uuid",
      "orderIndex": 1,
      "sets": [
        {
          "setNumber": 1,
          "reps": 10,
          "weight": 50,
          "durationSeconds": 0,
          "isCompleted": true,
          "notes": ""
        }
      ]
    }
  ]
}
```

---

### List Sessions

**GET** `/workoutSessions`

Requires authentication.

Query parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Sessions per page |
| startDate | string | Filter start date (YYYY-MM-DD) |
| endDate | string | Filter end date (YYYY-MM-DD) |
| templateId | string | Filter by template UUID |
| search | string | Search by name |

Response:
```json
{
  "success": true,
  "message": "Sessions retrieved",
  "data": {
    "sessions": [
      {
        "id": "uuid",
        "userId": "uuid",
        "title": "Push Day",
        "sessionDate": "2025-03-03",
        "durationMinutes": 60,
        "templateId": "uuid",
        "templateName": "Push Day",
        "exercises": [...],
        "notes": "Good workout",
        "createdAt": "2025-03-03T12:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "totalPages": 5
  },
  "timestamp": "2025-03-03T12:00:00.000Z"
}
```

---

### Get Session

**GET** `/workoutSessions/:id`

Requires authentication.

Response:
```json
{
  "success": true,
  "message": "Session retrieved",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "title": "Push Day",
    "sessionDate": "2025-03-03",
    "durationMinutes": 60,
    "templateId": "uuid",
    "templateName": "Push Day",
    "notes": "Good workout",
    "exercises": [
      {
        "id": "uuid",
        "sessionId": "uuid",
        "exerciseId": "uuid",
        "orderIndex": 1,
        "exerciseName": "Bench Press",
        "exerciseDescription": "Chest exercise",
        "muscleGroup": "chest",
        "difficulty": "intermediate",
        "sets": [
          {
            "id": "uuid",
            "sessionExerciseId": "uuid",
            "setNumber": 1,
            "reps": 10,
            "weight": 50,
            "durationSeconds": 0,
            "isCompleted": true,
            "notes": "",
            "createdAt": "2025-03-03T12:00:00.000Z"
          }
        ]
      }
    ],
    "createdAt": "2025-03-03T12:00:00.000Z"
  },
  "timestamp": "2025-03-03T12:00:00.000Z"
}
```

---

### Update Session

**PATCH** `/workoutSessions/:id`

Requires authentication.

Request:
```json
{
  "title": "Updated Push Day",
  "notes": "Updated notes",
  "duration": 75,
  "exercises": [...]
}
```

---

### Delete Session

**DELETE** `/workoutSessions/:id`

Requires authentication.

---

### Duplicate Session

**POST** `/workoutSessions/:id/duplicate`

Requires authentication.

Request:
```json
{
  "sessionDate": "2025-03-10"
}
```

---

## Health Check

### Get Health Status

**GET** `/health`

No authentication required.

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-03-03T12:00:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

---

## Response Format

All endpoints return a consistent response format:

```json
{
  "success": true,
  "message": "Success message",
  "data": { ... },
  "timestamp": "2025-03-03T12:00:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "error": "Error details",
  "timestamp": "2025-03-03T12:00:00.000Z"
}
```

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request successful, no content to return |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Not authorized to access resource |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error - Server error |
