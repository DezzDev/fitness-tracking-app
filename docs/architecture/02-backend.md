# Backend Architecture

## 1. Directory Structure

```
backend/src/
├── index.ts                  # App bootstrap, middleware stack, route mounting
├── config/
│   ├── env.ts                # Zod-validated environment variables
│   └── database.ts           # Turso connection, retry logic, health checks
├── routes/
│   ├── user.routes.ts        # /api/users
│   ├── exercise.routes.ts    # /api/exercises
│   ├── tag.routes.ts         # /api/tags
│   ├── personalRecord.routes.ts  # /api/personal-records
│   ├── workoutTemplate.routes.ts # /api/workoutTemplates
│   └── workoutSession.routes.ts  # /api/workoutSessions
├── controllers/
│   ├── user.controller.ts
│   ├── exercise.controller.ts
│   ├── personalRecord.controller.ts
│   ├── workoutTemplate.controller.ts
│   └── workoutSession.controller.ts
├── services/
│   ├── user.service.ts
│   ├── exercise.service.ts
│   ├── personalRecord.service.ts
│   ├── workoutTemplate.service.ts
│   └── workoutSession.service.ts
├── repositories/
│   ├── user.repository.ts
│   ├── exercise.repository.ts
│   ├── personalRecord.repository.ts
│   ├── workoutTemplate.repository.ts
│   └── workoutSession.repository.ts
├── schemas/                  # Zod v4 validation schemas
│   ├── user.schema.ts
│   ├── exercise.schema.ts
│   ├── personalRecord.schema.ts
│   ├── workoutTemplate.schema.ts
│   └── workoutSession.schema.ts
├── middlewares/
│   ├── auth.middleware.ts     # JWT authentication (required/optional)
│   ├── authorize.middleware.ts # Role-based authorization
│   ├── validate.middleware.ts  # Zod validation (body/params/query)
│   └── error.middleware.ts     # Centralized error handler + asyncHandler
├── types/
│   ├── index.ts              # Barrel exports
│   ├── express.d.ts          # Express request augmentation
│   ├── common/
│   │   ├── common.types.ts   # ApiResponse, NodeEnv, LogLevel
│   │   ├── error.types.ts    # AppError, ErrorCodes
│   │   └── database.types.ts # DatabaseConfig, QueryResult
│   └── entities/
│       ├── user.types.ts
│       ├── exercise.types.ts
│       ├── personalRecord.type.ts
│       ├── workoutTemplate.types.ts
│       └── workoutSession.type.ts
├── utils/
│   ├── jwt.utils.ts          # Token generation, verification, extraction
│   ├── error.utils.ts        # handleServiceError, analyzeError, type guards
│   ├── response.ts           # ResponseHandler (success/created/noContent/error)
│   ├── logger.ts             # Custom colored logger with level filtering
│   └── castRows.utils.ts     # Row-to-type casting helpers
├── script/
│   └── seeding.data.ts       # Database seeding script
├── test-utils/
│   ├── setup.ts              # Test environment setup
│   ├── helpers.ts            # Test helper functions
│   └── fixtures.ts           # Test fixtures
└── __tests__/
    ├── unit/
    │   ├── services/
    │   │   └── user.service.test.ts
    │   ├── repositories/
    │   │   └── user.repository.test.ts
    │   └── utils/
    │       └── jwt.utils.test.ts
    ├── integration/
    │   ├── auth.test.ts
    │   └── users.test.ts
    └── e2e/
        └── user-flow.test.ts
```

---

## 2. Layered Architecture

The backend follows a strict **4-layer architecture** where each layer has a single responsibility and dependencies only flow downward:

```
Request
   │
   ▼
┌──────────────────────────────────────────────────────┐
│ ROUTES                                               │
│  Define endpoints, compose middleware chain:         │
│  validation -> auth -> authorization -> controller   │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│ CONTROLLERS (thin HTTP layer)                        │
│  - Extract validated data from req                   │
│  - Call service method                               │
│  - Return response via ResponseHandler               │
│  - Wrapped with asyncHandler() for error propagation │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│ SERVICES (business logic)                            │
│  - Exported as object literals (not classes)         │
│  - Throw AppError via createAppError() for biz errors│
│  - Use handleServiceError() in catch blocks          │
│  - Orchestrate repository calls                      │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│ REPOSITORIES (data access)                           │
│  - Raw parameterized SQL via LibSQL client           │
│  - Map snake_case DB rows to camelCase objects       │
│  - Use execute() and batch() from database.ts        │
│  - UUID primary keys                                 │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
                   [ Turso DB ]
```

---

## 3. Request Lifecycle

A typical authenticated request flows through:

```
HTTP Request
    │
    ├─ 1. Global Middleware: helmet, cors, json parser, logging
    │
    ├─ 2. Route Match: /api/users/:id
    │
    ├─ 3. Validation Middleware: validateParams(UserIdSchema)
    │     → Parses with Zod, sets req.validatedParams
    │
    ├─ 4. Auth Middleware: requireAuth
    │     → Extracts JWT from Authorization header
    │     → Verifies token, attaches req.user { userId, email, role }
    │
    ├─ 5. Authorization Middleware: requireAdmin (optional)
    │     → Checks req.user.role against allowed roles
    │
    ├─ 6. Controller (wrapped in asyncHandler)
    │     → Reads req.validatedBody / req.validatedParams / req.validatedQuery
    │     → Calls service method
    │     → Returns ResponseHandler.success(res, data, message)
    │
    └─ 7. Error Handler (if any error thrown)
          → Catches AppError, ZodError, or unknown errors
          → Returns consistent JSON error response via ResponseHandler.error()
```

---

## 4. Middleware Stack

Applied in order at `index.ts`:

| Order | Middleware             | Purpose                                |
|-------|------------------------|----------------------------------------|
| 1     | Static files           | Serves `/public` directory             |
| 2     | Request logging        | Logs method + URL for all requests     |
| 3     | Debug logging          | Logs body/query in development mode    |
| 4     | `helmet()`             | Security headers                       |
| 5     | `cors()`               | CORS configuration (`*` in dev)        |
| 6     | `express.json()`       | JSON body parsing                      |
| 7     | `express.urlencoded()` | URL-encoded body parsing               |
| 8     | Route handlers         | API route matching                     |
| 9     | `notFoundHandler`      | 404 for unmatched routes               |
| 10    | `errorHandler`         | Centralized error handling             |

---

## 5. Authentication & Authorization

**Authentication** (`auth.middleware.ts`):
- `authenticate(options)` -- configurable middleware factory
- `requireAuth` -- alias for `authenticate()` (required)
- `optionalAuth` -- alias for `authenticate({ required: false })`
- Extracts JWT from `Authorization: Bearer <token>` header
- Verifies token using `jsonwebtoken` with issuer/audience validation
- Attaches `req.user = { userId, email, role }` on success

**Authorization** (`authorize.middleware.ts`):
- `authorize(roles)` -- role-based access control
- `requireAdmin` -- alias for `authorize('admin')`
- `requireUser` -- alias for `authorize(['user', 'admin'])`
- Must be used after `authenticate()`

**JWT Tokens** (`jwt.utils.ts`):
- Access token: 7 days expiry
- Refresh token: 30 days expiry
- Payload: `{ userId, email, role }`
- Issuer: `fitness-tracker-app`, Audience: `fitness-tracker-users`

---

## 6. Error Handling

```
Service throws AppError
        │
        ▼
asyncHandler catches → next(error)
        │
        ▼
errorHandler middleware
  ├── AppError → uses statusCode, message, details
  ├── ZodError → 400 with formatted field errors
  └── Unknown  → 500 Internal Server Error
        │
        ▼
ResponseHandler.error(res, payload, statusCode)
```

- **`createAppError(message, statusCode, isOperational, details)`** -- factory for business errors
- **`handleServiceError(error, context, userMessage, metadata)`** -- normalizes errors in service catch blocks; re-throws `AppError` as-is, analyzes generic `Error` for category (timeout/connection/database/unknown)
- **`asyncHandler(fn)`** -- HOF wrapping async controllers to catch promise rejections

---

## 7. Response Pattern

All successful responses use `ResponseHandler` from `utils/response.ts`:

```typescript
ResponseHandler.success(res, data, 'message');    // 200
ResponseHandler.created(res, data, 'message');    // 201
ResponseHandler.noContent(res);                   // 204
```

Consistent response shape:
```json
{
  "success": true,
  "message": "string",
  "data": {},
  "timestamp": "ISO 8601"
}
```

---

## 8. Validation

- **Zod v4** schemas defined in `schemas/*.schema.ts`
- Middleware variants: `validateBody()`, `validateParams()`, `validateQuery()`
- Validated data stored on `req.validatedBody`, `req.validatedParams`, `req.validatedQuery`
- Multi-validation and data transformation middleware also available

---

## 9. Database

- **Turso** (cloud LibSQL/SQLite) via `@libsql/client`
- Configuration in `config/database.ts`:
  - Connection with retry (3 attempts, exponential backoff)
  - Query execution with retry (2 attempts)
  - Periodic health checks (every 30 seconds)
  - Graceful disconnect on shutdown
- Helper functions: `execute({ sql, args })` and `batch(queries)` for parameterized queries
- Environment variables: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (Zod-validated at startup)

---

## 10. API Routes

| Base Path               | Auth     | Domain              |
|--------------------------|----------|---------------------|
| `/api/users`             | Mixed    | User management     |
| `/api/exercises`         | Mixed    | Exercise catalog    |
| `/api/tags`              | Mixed    | Exercise tags       |
| `/api/personal-records`  | Required | Personal records    |
| `/api/workoutTemplates`  | Required | Workout templates   |
| `/api/workoutSessions`   | Required | Workout sessions    |
| `/health`                | None     | Health check        |

**"Mixed"** means some endpoints are public (register, login, list exercises) while others require authentication or admin role.
