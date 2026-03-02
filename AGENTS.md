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
