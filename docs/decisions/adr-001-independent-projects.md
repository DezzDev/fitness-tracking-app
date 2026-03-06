# ADR-001: Independent Frontend and Backend Projects

**Status**: Accepted  
**Date**: 2025-01-01  
**Scope**: Project structure

## Context

The fitness tracker app requires both a REST API backend and a single-page application frontend. The question is whether to manage them as a monorepo (with a shared root `package.json`, workspace tooling like Turborepo/Nx, or pnpm workspaces) or as independent projects within the same repository.

## Decision

Keep frontend and backend as **independent projects** with no shared root `package.json` or monorepo tooling. Each lives in its own directory (`/backend`, `/frontend`) with its own `package.json`, `tsconfig.json`, and `pnpm-lock.yaml`.

## Rationale

- **Simplicity**: No workspace configuration, no hoisting issues, no shared dependency conflicts between Express 5 and React 19.
- **Independent deployment**: Each project can be built, deployed, versioned, and scaled on its own. The backend can run as a standalone API server while the frontend deploys to any static hosting.
- **Independent tooling**: Each project has its own ESLint flat config, TypeScript strict mode settings, and build pipeline (tsc for backend, Vite for frontend) without needing to coordinate through a root config.
- **Low overhead**: With only two projects and no shared libraries, monorepo tooling (Turborepo, Nx, Lerna) would add complexity without meaningful benefit.

## Consequences

- **No shared code**: Types, utilities, or validation schemas cannot be shared between frontend and backend without copy-pasting or extracting a separate package.
- **Separate installs**: Running `pnpm install` must be done in each directory independently.
- **No unified commands**: There is no single command to build or test both projects. Developers must `cd` into each directory.

## Alternatives Considered

| Alternative | Rejected Because |
|---|---|
| pnpm workspaces | Added configuration overhead for only two independent projects with no shared packages |
| Turborepo / Nx | Enterprise-grade tooling unnecessary for a two-project setup; adds learning curve |
| Single project (full-stack framework like Next.js) | Backend is a standalone REST API consumed by a SPA; SSR/RSC not needed |
