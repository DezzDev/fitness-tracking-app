# AGENTS.md - Fitness Tracker App

This document provides guidelines for agentic coding agents working on this repository.

## Project Overview

Full-stack fitness tracking application with:
- **Backend**: Node.js + Express + TypeScript (in `/backend`)
- **Frontend**: Vite + React + TypeScript (in `/frontend`)

---

## Commands

### Backend (run from `/backend`)

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start development server with hot reload |
| `pnpm run build` | Compile TypeScript to `/dist` |
| `pnpm run start` | Run production build |
| `pnpm run test` | Run all tests |
| `pnpm run test:unit` | Run unit tests only |
| `pnpm run test:integration` | Run integration tests only |
| `pnpm run test:e2e` | Run e2e tests only |
| `pnpm run test:coverage` | Run tests with coverage report |
| `pnpm run seed` | Run database seeding script |

**Single test file**: Use Jest's `--testPathPatterns` or `--testNamePattern`:
```bash
pnpm test -- --testPathPatterns=user.service.test.ts
pnpm test -- --testNamePattern="should create user"
```

### Frontend (run from `/frontend`)

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start Vite dev server |
| `pnpm run build` | TypeScript check + build |
| `pnpm run lint` | Run ESLint |
| `pnpm run preview` | Preview production build |

---

## Code Style Guidelines

### TypeScript

- **Strict mode enabled** on both backend and frontend
- Use explicit types; avoid `any`
- Enable `strictNullChecks` - always handle null/undefined
- Use `noUncheckedIndexedAccess` - array access returns `T | undefined`

### Imports & Path Aliases

Both projects use `@/` alias for `/src`:

```typescript
// Backend
import { UserService } from '@/services/user.service';

// Frontend
import { Button } from '@/components/ui/button';
```

### Naming Conventions

- **Files**: kebab-case (`user.service.ts`, `workout.controller.ts`)
- **Classes/Types**: PascalCase (`UserService`, `WorkoutEntity`)
- **Variables/Functions**: camelCase (`getUserById`, `isActive`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Interfaces**: PascalCase, optionally with `I` prefix only if unambiguous (`User` or `IUser`)

### Error Handling

- Backend: Use Zod for request validation schemas
- Use centralized error utilities (`src/utils/error.utils.ts`)
- Always return proper HTTP status codes
- Wrap async route handlers with proper error middleware

### Backend Architecture (Layered)

```
controllers/    -> HTTP layer, request/response handling
services/       -> Business logic
repositories/  -> Data access
schemas/        -> Zod validation schemas
middlewares/    -> Express middlewares (auth, validation, errors)
```

### Frontend Architecture

- Use React Router for navigation
- Use Zustand for state management
- Use React Query for server state
- Use `sonner` for toasts/notifications
- Use Radix UI primitives with shadcn/ui patterns

### Formatting

- **Semicolons**: Required (ESLint rule in backend)
- **Quotes**: Single quotes preferred
- **Indentation**: 2 spaces
- **Max line length**: 100 characters (soft limit)

### Testing

- Tests in `backend/__tests__/` organized by: `unit/`, `integration/`, `e2e/`
- Test files: `*.test.ts`
- Use provided test utilities from `src/test-utils/`
- Jest configured with ts-jest, coverage threshold 70%
- Tests use `jest-mock-extended` for mocking

### ESLint & Type Checking

**Backend**: Uses ESLint 9 with TypeScript ESLint (strict + stylistic presets)
**Frontend**: Uses ESLint 9 with React hooks and React Refresh plugins

Run manually:
```bash
# Backend
cd backend && npx eslint . && pnpm run build

# Frontend
cd frontend && pnpm lint && pnpm run build
```

---

## Database

- Uses LibSQL (SQLite-compatible)
- Configuration in `backend/src/config/database.ts`
- Migrations managed manually (check `/documents/tables.md`)

---

## Important Files

- Backend entry: `backend/src/index.ts`
- Frontend entry: `frontend/src/main.tsx`
- Auth middleware: `backend/src/middlewares/auth.middleware.ts`
- JWT utils: `backend/src/utils/jwt.utils.ts`

---

## Skills Available

This project has loaded skills for:
- **web-design-guidelines**: For UI review
- **vercel-react-best-practices**: For React/Next.js performance
- **copywriting**: For marketing copy
- **frontend-design**: For creating UI components
