# ADR-008: Centralized Error Handling with AppError

**Status**: Accepted  
**Date**: 2025-01-01  
**Scope**: Backend

## Context

Express applications need a consistent way to handle errors across all layers. Without a centralized approach, error handling logic gets duplicated in every route handler, and error responses become inconsistent.

## Decision

Implement a **centralized error handling system** with three components:

1. **`AppError`** -- Custom error class with `statusCode`, `message`, `isOperational`, and `details` properties. Created via `createAppError()` factory.
2. **`asyncHandler(fn)`** -- Higher-order function wrapping async controller methods to catch rejected promises and forward them to `next(error)`.
3. **`errorHandler`** -- Express error middleware (final in the stack) that catches all errors and returns a consistent JSON response via `ResponseHandler.error()`.

### Error Flow

```
Service throws AppError  →  asyncHandler catches  →  next(error)  →  errorHandler middleware
                                                                          ├── AppError → uses statusCode + message
                                                                          ├── ZodError → 400 with field errors
                                                                          └── Unknown  → 500 Internal Server Error
```

### Service Error Pattern

Services use `handleServiceError()` in catch blocks to normalize errors:
- Re-throws `AppError` as-is (business errors bubble up unchanged)
- Analyzes generic `Error` for category (timeout, connection, database, unknown)
- Logs context metadata for debugging

## Consequences

### Positive

- **Consistent response shape**: Every error returns `{ success: false, message, error, timestamp }` regardless of where it was thrown
- **Single error formatting point**: The `errorHandler` middleware is the only place that formats error responses
- **Clean controllers**: Controllers contain no try-catch blocks; `asyncHandler` handles propagation
- **Zod integration**: Validation errors from Zod middleware are automatically caught and formatted with field-level detail
- **Error categorization**: `handleServiceError` categorizes unknown errors (timeout, connection, DB) for appropriate logging and status codes

### Negative

- **All errors flow to one handler**: Debugging requires tracing through the async error propagation chain
- **`isOperational` not fully utilized**: The distinction between operational and programmer errors exists in `AppError` but is not used for different handling strategies (e.g., process restart)

## References

- Error middleware: `backend/src/middlewares/error.middleware.ts`
- Error utilities: `backend/src/utils/error.utils.ts`
- Error types: `backend/src/types/common/error.types.ts`
- Response handler: `backend/src/utils/response.ts`
- Architecture docs: `docs/architecture/02-backend.md` (section 6)
