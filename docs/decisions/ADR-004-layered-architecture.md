# ADR-004: 4-Layer Backend Architecture

**Status**: Accepted  
**Date**: 2025-01-01  
**Scope**: Backend

## Context

The backend needs a clear structure that separates HTTP concerns from business logic and data access. Without explicit boundaries, Express applications tend to accumulate logic in route handlers, making testing and maintenance difficult.

## Decision

Adopt a strict **4-layer architecture** where dependencies flow downward only:

```
Routes → Controllers → Services → Repositories → Database
```

Each layer has a single responsibility:

| Layer | Responsibility | Rules |
|-------|---------------|-------|
| **Routes** | Define endpoints, compose middleware chain (validation → auth → authorization → controller) | No business logic, no direct DB access |
| **Controllers** | Thin HTTP layer: extract validated data from `req`, call one service method, return response via `ResponseHandler` | No business logic, no repository calls |
| **Services** | Business logic, orchestration, error handling | Throw `AppError` for business errors, call repositories, no HTTP concepts (`req`/`res`) |
| **Repositories** | Raw SQL execution, row-to-object mapping | No business logic, only data access |

## Consequences

### Positive

- **Testability**: Each layer can be tested in isolation; services are unit-tested by mocking repositories, controllers by mocking services
- **Single responsibility**: Each file has one clear job
- **Consistent patterns**: Every domain (users, exercises, templates, sessions, personal records) follows the same structure
- **Thin controllers**: Controllers are 5-10 lines; all logic lives in services where it can be reused
- **Clear error flow**: Services throw business errors, controllers propagate via `asyncHandler`, centralized `errorHandler` catches everything

### Negative

- **Boilerplate**: Each new domain entity requires 5 files (route, controller, service, repository, schema) even for simple CRUD
- **Indirection**: A simple database query passes through 4 layers
- **Rigid structure**: Cross-cutting concerns that span multiple domains require careful service-to-service orchestration

## References

- Layer diagram: `docs/architecture/02-backend.md` (section 2)
- Request lifecycle: `docs/architecture/02-backend.md` (section 3)
- Directory structure: `docs/architecture/02-backend.md` (section 1)
