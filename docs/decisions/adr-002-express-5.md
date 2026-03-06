# ADR-002: Express 5 as HTTP Framework

**Status**: Accepted  
**Date**: 2025-01-01  
**Scope**: Backend

## Context

The backend needs an HTTP framework to handle routing, middleware, and request processing. Node.js has many options: Express, Fastify, Hono, Koa, NestJS, and others.

## Decision

Use **Express 5** as the HTTP framework for the backend API.

## Rationale

- **Native async error handling**: Express 5 natively catches rejected promises from async route handlers and forwards them to the error middleware. This eliminates the need for manual try-catch in every handler, though we still use `asyncHandler()` as an explicit safety wrapper.
- **Ecosystem maturity**: Express has the largest middleware ecosystem in Node.js. Libraries like `helmet`, `cors`, and `express.json()` work out of the box.
- **Familiarity**: Express is the most widely known Node.js framework, reducing onboarding friction.
- **Minimal abstraction**: Express provides routing and middleware composition without imposing patterns like dependency injection or decorators.

## Consequences

- **No built-in validation**: Express does not include request validation. This is handled separately via Zod middleware (see ADR-005).
- **No built-in structure**: Express does not enforce a layered architecture. The 4-layer pattern (routes/controllers/services/repositories) is a project convention (see ADR-004).
- **Performance**: Express is not the fastest Node.js framework (Fastify, Hono are faster in benchmarks), but performance is adequate for this application's scale.

## Alternatives Considered

| Alternative | Rejected Because |
|---|---|
| Fastify | Faster, but Express 5 async support closes the DX gap; Express ecosystem is larger |
| Hono | Lightweight and fast, but younger ecosystem with fewer battle-tested middleware options |
| NestJS | Full-featured but opinionated (decorators, DI, modules); excessive for a focused API |
| Koa | Smaller ecosystem than Express; Express 5 now has the async middleware handling that Koa pioneered |
