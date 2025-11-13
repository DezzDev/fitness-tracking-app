# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Full-stack fitness tracking application with a TypeScript/Express backend API and React/Vite frontend. The backend uses Turso (LibSQL) as the database and follows a layered architecture (Controller → Service → Repository).

**Package Manager**: `pnpm` (specified in backend/package.json)

## Common Commands

### Backend (Express/TypeScript API)

Location: `backend/`

```powershell
# Development
cd backend
pnpm install
pnpm dev              # Start dev server with hot reload (ts-node-dev)
pnpm dev:debug        # Start with debugging enabled

# Building
pnpm build            # Compile TypeScript to dist/

# Production
pnpm start            # Run compiled code from dist/

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Run unit tests only
pnpm test:integration # Run integration tests only
pnpm test:e2e         # Run end-to-end tests only
pnpm test:coverage    # Run tests with coverage report
```

### Frontend (React/Vite)

Location: `frontend/`

```powershell
# Development
cd frontend
pnpm install
pnpm dev              # Start Vite dev server

# Building
pnpm build            # TypeScript check + Vite build

# Linting
pnpm lint             # Run ESLint

# Preview
pnpm preview          # Preview production build locally
```

## Architecture

### Backend Layered Architecture

The backend follows a strict 3-layer architecture pattern:

**Flow**: `Request → Controller → Service → Repository → Database`

#### Layer Responsibilities

| Layer | Responsibilities | Must NOT Do |
|-------|------------------|-------------|
| **Controller** (`src/controllers/`) | - Receive requests<br>- Extract/validate IDs and parameters<br>- Call services<br>- Return formatted responses (via `ResponseHandler`) | ❌ Business logic<br>❌ Database access |
| **Service** (`src/services/`) | - Business logic and validation<br>- Orchestrate multiple repositories<br>- Error handling with `handleServiceError`<br>- Transform data between schemas and entities | ❌ Handle req/res objects<br>❌ Write SQL directly |
| **Repository** (`src/repositories/`) | - SQL queries and database access<br>- Map database rows to domain entities<br>- CRUD operations | ❌ Business logic<br>❌ Complex validation |

#### Key Patterns

1. **Functional Repository Pattern**: Repositories export objects with methods, using pure functions for SQL query generation
2. **Schema Validation**: Zod schemas (`src/schemas/`) validate inputs before reaching services
3. **Error Handling**: All service errors must be `AppError` instances (created via `createAppError`)
4. **Path Aliases**: `@/` maps to `src/` (configured in tsconfig.json with `tsconfig-paths`)

### Backend Structure

```
backend/
├── src/
│   ├── config/          # Database, environment configuration
│   ├── controllers/     # Request handlers, call services
│   ├── middlewares/     # Auth, validation, error handling
│   │   ├── auth.middleware.ts      # JWT authentication
│   │   ├── authorize.middleware.ts # Role-based access control
│   │   ├── validate.middleware.ts  # Zod schema validation
│   │   └── error.middleware.ts     # Error handling & AppError
│   ├── repositories/    # Database access layer
│   ├── routes/          # Express route definitions
│   ├── schemas/         # Zod validation schemas
│   ├── services/        # Business logic layer
│   ├── types/           # TypeScript type definitions
│   │   ├── common/      # Common types (API, errors, database)
│   │   └── entities/    # Domain entity types
│   ├── utils/           # Helper functions (logger, JWT, response)
│   ├── test-utils/      # Test setup and utilities
│   └── __tests__/       # Test files (unit, integration, e2e)
│       ├── unit/
│       ├── integration/
│       └── e2e/
├── public/images/       # Static assets (e.g., default-avatar.jpg)
├── dist/                # Compiled output (gitignored)
└── index.ts             # Application entry point
```

### Key Backend Concepts

#### Middleware Chain Pattern

Routes use middleware composition for validation and authorization:

```typescript
router.patch(
  '/:id',
  requireAuth,              // JWT authentication
  validateParams(UserIdSchema),
  validateBody(UpdateUserSchema),
  userController.updateUser
);
```

#### Request Flow Example

1. **Route**: Defines middleware chain and maps to controller
2. **Validation Middleware**: Uses Zod schemas, attaches validated data to `req.validatedBody`, `req.validatedParams`, `req.validatedQuery`
3. **Auth Middleware**: Verifies JWT, attaches `req.user` (userId, email, role)
4. **Controller**: Extracts validated data, calls service, returns response via `ResponseHandler`
5. **Service**: Business logic, calls repositories, throws `AppError` on failure
6. **Repository**: Executes SQL via `execute()` or `executeWithRetry()`, maps rows to entities

#### Database Access

- **Client**: Turso LibSQL via `@libsql/client`
- **Connection**: Managed in `config/database.ts` with retry logic
- **Helpers**: 
  - `execute()`: Execute single query with retry
  - `executeWithRetry()`: Custom retry logic for queries
  - `getClient()`: Get database client (throws if not connected)

#### Authentication & Authorization

- **JWT**: Generated/verified in `utils/jwt.utils.ts`
- **Auth Middleware**: `requireAuth` (requires valid token), `optionalAuth` (token optional)
- **Authorization**: `requireAdmin` middleware checks `req.user.role === 'admin'`

### Frontend Structure

```
frontend/
├── src/
│   ├── assets/          # Static assets (images, etc.)
│   ├── App.tsx          # Main App component
│   ├── App.css
│   ├── main.tsx         # Entry point
│   └── index.css
└── public/              # Public assets
```

Currently minimal React setup with Vite + TypeScript. Frontend is early stage compared to backend.

### Database Schema

**Database**: Turso (LibSQL - SQLite-compatible)

Main tables:
- `users`: User accounts (id, email, password_hash, name, age, role, profile_image, is_active, timestamps)
- `exercises`: Exercise definitions (name, description, difficulty, muscle_group, type)
- `workouts`: User workout sessions (user_id, title, notes)
- `workout_exercises`: Exercises in a workout (workout_id, exercise_id, order_index)
- `workout_exercise_sets`: Set details (reps, duration, weight, rest_seconds)
- `progress_logs`: Body metrics tracking (body_weight, body_fat_percent)
- `tags`: Exercise tags
- `user_goals`: User fitness goals
- `personal_records`: Personal record tracking

See `documents/database/tables.md` for full schema.

## Configuration

### Environment Variables (Backend)

Required in `backend/.env`:

```
NODE_ENV=development
PORT=3000
TURSO_DATABASE_URL=<your-turso-url>
TURSO_AUTH_TOKEN=<your-turso-token>
LOG_LEVEL=info
JWT_SECRET=<64-char-hex-string>
```

Generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### TypeScript Configuration

- **Backend**: Strict mode enabled, paths aliased with `@/*` → `src/*`, uses `nodenext` modules
- **Frontend**: Project references setup (tsconfig.app.json, tsconfig.node.json)

### Testing Configuration

- **Framework**: Jest with ts-jest preset
- **Setup**: `src/test-utils/setup.ts`
- **Path mapping**: Jest configured to resolve `@/` alias
- **Coverage**: 70% threshold for branches/functions/lines/statements
- **Timeout**: 10 seconds per test

## Development Guidelines

### When Creating New Features

1. **Define Schema**: Create Zod schema in `src/schemas/` for input validation
2. **Define Types**: Add entity types to `src/types/entities/`
3. **Repository**: Add database queries following functional pattern (queries object + methods)
4. **Service**: Implement business logic, use `handleServiceError` for error handling
5. **Controller**: Create handlers using `asyncHandler`, extract data from `req.validated*`
6. **Routes**: Define routes with middleware chain (validation → auth → controller)
7. **Tests**: Write unit tests for repository/service, integration tests for routes

### Error Handling Pattern

Services should throw `AppError`:
```typescript
throw createAppError('User not found', 404);
```

Use `handleServiceError` to wrap repository calls:
```typescript
try {
  // service logic
} catch (error) {
  throw handleServiceError(error, 'ServiceName.method', 'User-friendly message', { context });
}
```

### Validation Pattern

1. Define Zod schema in `src/schemas/`
2. Use validation middleware in routes: `validateBody()`, `validateParams()`, `validateQuery()`
3. Access validated data from `req.validatedBody`, `req.validatedParams`, `req.validatedQuery`

### Response Pattern

Use `ResponseHandler` utility for consistent responses:
```typescript
ResponseHandler.success(res, data, 'Optional message');
ResponseHandler.created(res, data, 'Resource created');
ResponseHandler.noContent(res);
```

## Important Notes

- **Database soft deletes**: Users have `is_active` flag; use `softDelete()` by default
- **Static files**: Served from `backend/public/` at `/public/*` route
- **Logging**: Winston logger configured in `utils/logger.ts`, respects `LOG_LEVEL` env var
- **Security**: Helmet and CORS configured; CORS allows all origins in development
- **Health check**: `GET /health` endpoint returns server status
- **API prefix**: All routes under `/api/*` (e.g., `/api/users`)
