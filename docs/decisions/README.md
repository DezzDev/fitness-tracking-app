# Architecture Decision Records (ADRs)

Decisions que dan forma a la arquitectura del Fitness Tracker App, documentadas en formato ADR (Architecture Decision Record).

Cada archivo sigue la estructura: **Context** (problema), **Decision** (que se eligio), **Rationale/Consequences** (por que, tradeoffs), **Alternatives Considered** (que se descarto).

---

## Index

### Project Structure

| ADR | Decision | Scope |
|-----|----------|-------|
| [ADR-001](./adr-001-independent-projects.md) | Independent frontend/backend projects (no monorepo) | Project |
| [ADR-013](./ADR-013-templates-vs-sessions.md) | Separated workout templates and sessions | Domain Model |

### Backend

| ADR | Decision | Scope |
|-----|----------|-------|
| [ADR-002](./adr-002-express-5.md) | Express 5 as HTTP framework | Backend |
| [ADR-003](./ADR-003-turso-raw-sql.md) | Turso (LibSQL) with raw SQL, no ORM | Backend, Database |
| [ADR-004](./ADR-004-layered-architecture.md) | 4-layer architecture (routes/controllers/services/repositories) | Backend |
| [ADR-005](./ADR-005-zod-validation.md) | Zod v4 for validation and env config | Backend, Frontend |
| [ADR-006](./ADR-006-jwt-localstorage.md) | JWT authentication with localStorage | Backend, Frontend |
| [ADR-007](./ADR-007-object-literal-services.md) | Object literals over classes for services | Backend |
| [ADR-008](./ADR-008-centralized-error-handling.md) | Centralized error handling with AppError | Backend |

### Frontend

| ADR | Decision | Scope |
|-----|----------|-------|
| [ADR-009](./ADR-009-dual-state-management.md) | Dual state management (Zustand + React Query) | Frontend |
| [ADR-010](./ADR-010-feature-based-structure.md) | Feature-based frontend structure | Frontend |
| [ADR-011](./ADR-011-shadcn-ui.md) | shadcn/ui as component library | Frontend |
| [ADR-014](./ADR-014-tailwind-v4-css-config.md) | Tailwind CSS v4 with CSS-only configuration | Frontend |

### Design

| ADR | Decision | Scope |
|-----|----------|-------|
| [ADR-012](./ADR-012-dark-theme-orange-accent.md) | Dark-only theme with orange accent system | Frontend, Design |
| [ADR-015](./ADR-015-spanish-ui-language.md) | Spanish as UI language | Frontend |

---

## How to Add a New ADR

1. Create a file: `ADR-NNN-short-description.md`
2. Use the template structure: Status, Date, Scope, Context, Decision, Consequences, Alternatives Considered, References
3. Set Status to `Proposed` initially, then `Accepted` after team review
4. Add the entry to the index table above
