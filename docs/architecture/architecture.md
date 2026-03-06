# Fitness Tracker App - Architecture

Comprehensive architecture documentation for the full-stack fitness tracking application.

| Layer    | Stack                                                       |
|----------|-------------------------------------------------------------|
| Backend  | Node.js, Express 5, TypeScript, Zod v4, JWT, bcrypt        |
| Frontend | Vite 7, React 19, TypeScript, Tailwind CSS v4, shadcn/ui   |
| Database | Turso (cloud LibSQL/SQLite) via `@libsql/client` -- raw SQL |
| State    | Zustand v5 (client), React Query v5 (server)                |

---

## Table of Contents

1. [Overview](./01-overview.md) -- Project structure, high-level architecture diagram, tech stack summary
2. [Backend Architecture](./02-backend.md) -- Directory structure, layered architecture (routes/controllers/services/repositories), middleware stack, auth, error handling, validation, database access, API routes
3. [Frontend Architecture](./03-frontend.md) -- Directory structure, app bootstrap, state management (Zustand + React Query), API layer (Axios), routing, feature modules, UI library (shadcn/ui)
4. [Data Flow](./04-data-flow.md) -- Authentication flow, React Query data flow, workout session creation from template
5. [Domain Model](./05-domain-model.md) -- Entity relationship diagram, core entities reference
6. [Testing](./06-testing.md) -- Test structure, utilities, configuration, commands
7. [Design Decisions](./07-design-decisions.md) -- Key architectural decisions and rationale, environment config, full dependency list
8. [Design System](./08-design-system.md) -- Color palette, typography, spacing, responsive breakpoints, component library, domain patterns, glow effects, icons, forms, toasts, animation, navigation
