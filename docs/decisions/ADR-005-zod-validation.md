# ADR-005: Zod v4 for Validation and Environment Configuration

**Status**: Accepted  
**Date**: 2025-01-01  
**Scope**: Backend, Frontend

## Context

The application needs request validation (body, params, query), form validation on the frontend, and environment variable validation at startup. Using different libraries for each creates inconsistency and increases the learning surface.

## Decision

Use **Zod v4** as the single schema validation language across the entire stack:

- **Backend request validation**: Schemas in `backend/src/schemas/*.schema.ts` used by `validateBody()`, `validateParams()`, `validateQuery()` middleware
- **Backend environment config**: `backend/src/config/env.ts` validates all env vars at startup via Zod
- **Frontend form validation**: Schemas in `frontend/src/features/*/schemas/` used with `@hookform/resolvers/zod`

## Consequences

### Positive

- **Single schema language**: One API for defining, parsing, and inferring types everywhere
- **Type inference**: `z.infer<typeof schema>` eliminates type duplication; schemas are the source of truth
- **Fail-fast env validation**: Invalid environment variables cause the app to crash immediately at startup with descriptive errors, not at runtime when a missing variable is first accessed
- **Consistent error format**: Zod validation errors follow a predictable structure; the `errorHandler` middleware formats `ZodError` into field-level messages
- **Composable schemas**: Schemas can be combined, extended, and refined across layers

### Negative

- **Bundle size**: Zod is included in both frontend and backend bundles
- **Zod v4 is recent**: Fewer community resources compared to v3; some ecosystem tools may lag behind
- **Middleware coupling**: The `validate.middleware.ts` stores parsed data on custom `req` properties (`req.validatedBody`, `req.validatedParams`, `req.validatedQuery`), requiring TypeScript declaration merging in `express.d.ts`

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Joi | No TypeScript-first inference; heavier API |
| Yup | Less precise TypeScript inference than Zod |
| AJV / JSON Schema | Good performance but poor DX for TypeScript inference |
| class-validator | Decorator-based; conflicts with plain object pattern used in services |
| Separate libraries per concern | Increases cognitive load and inconsistency |

## References

- Backend schemas: `backend/src/schemas/`
- Validation middleware: `backend/src/middlewares/validate.middleware.ts`
- Env config: `backend/src/config/env.ts`
- Frontend form schemas: `frontend/src/features/*/schemas/`
- Error handling for Zod: `docs/architecture/02-backend.md` (section 6)
