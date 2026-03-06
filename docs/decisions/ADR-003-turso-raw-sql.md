# ADR-003: Turso (LibSQL) with Raw SQL, No ORM

**Status**: Accepted  
**Date**: 2025-01-01  
**Scope**: Backend, Database

## Context

The application needs a relational database to store users, exercises, workout templates, sessions, and personal records. A decision was needed on both the database engine and the data access strategy (ORM vs. raw SQL).

## Decision

Use **Turso** (cloud LibSQL/SQLite) via `@libsql/client` with **raw parameterized SQL** in repository files. No ORM is used.

## Consequences

### Positive

- **Full query control**: Raw SQL gives complete control over queries, joins, and optimizations without ORM abstraction leaks
- **Lightweight**: SQLite-based; no separate database server process to manage in development
- **Cloud-native**: Turso provides edge-replicated SQLite with a simple SDK
- **Transparent data access**: Repositories contain readable SQL; no magic query builders or entity metadata
- **Simple mapping**: `castRows.utils.ts` handles `snake_case` DB columns to `camelCase` TypeScript objects
- **Connection resilience**: Database config implements retry logic (3 attempts for connection, 2 for queries) with exponential backoff and periodic health checks

### Negative

- **Manual migrations**: No migration framework; schema changes managed manually via `documents/database/`
- **Manual mapping**: Every query result must be manually mapped to TypeScript types
- **SQL repetition**: Common patterns (pagination, filtering) are repeated across repositories
- **SQLite limitations**: No native `ENUM` types, limited concurrent write throughput compared to PostgreSQL/MySQL
- **Vendor coupling**: `@libsql/client` SDK ties the project to Turso's LibSQL protocol

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Prisma | Heavy abstraction, generated client adds build complexity, less control over queries |
| Drizzle ORM | Closer to raw SQL but still adds an abstraction layer; the project preferred full transparency |
| TypeORM | Class-based entity approach conflicts with project conventions; known performance issues |
| PostgreSQL (Supabase/Neon) | More powerful but heavier; SQLite is sufficient for the current scale |
| SQLite (local only) | No cloud sync or edge replication; Turso adds this on top of SQLite |

## References

- Database config: `backend/src/config/database.ts`
- Repository layer: `docs/architecture/02-backend.md` (section 2, 9)
- Environment variables: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`
