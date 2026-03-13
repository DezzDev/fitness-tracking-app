# Design Decisions, Environment & Tech Stack

## 1. Key Design Decisions

| Decision                           | Rationale                                                |
|------------------------------------|----------------------------------------------------------|
| No ORM (raw SQL)                   | Full control over queries; SQLite via Turso is lightweight |
| Object literals over classes       | Services are stateless; simpler, tree-shakeable exports  |
| Zod for both validation and env    | Single schema language for API input and configuration   |
| Zustand for auth only              | Lightweight client state; server state handled by React Query |
| Feature-based frontend structure   | Colocated code per domain; scales better than type-based |
| shadcn/ui (copy-paste components)  | Full ownership of UI code; no dependency lock-in         |
| JWT with localStorage              | Simple token-based auth; suitable for SPA                |
| Separated templates and sessions   | Templates are reusable plans; sessions are actual logs   |
| Express 5                          | Native async error handling support                      |
| Independent frontend/backend       | Can be deployed, versioned, and scaled independently     |

---

## 2. Environment Configuration

### Backend (`backend/.env`)

| Variable            | Description                  | Validation                             |
|---------------------|------------------------------|----------------------------------------|
| `NODE_ENV`          | Environment mode             | `development` / `production` / `test`  |
| `PORT`              | Server port                  | Integer 1-65535                        |
| `TURSO_DATABASE_URL`| Turso database URL           | Valid URL                              |
| `TURSO_AUTH_TOKEN`  | Turso auth token             | Non-empty string                       |
| `LOG_LEVEL`         | Logging verbosity            | `debug` / `info` / `warn` / `error`   |
| `JWT_SECRET`        | Secret for JWT signing       | Non-empty string                       |

### Frontend (`frontend/.env`)

| Variable       | Description      | Default                      |
|----------------|------------------|------------------------------|
| `VITE_API_URL` | Backend API URL  | `http://localhost:3000/api`  |

---

## 3. Technology Stack

### Backend Dependencies

| Package             | Purpose                        |
|---------------------|--------------------------------|
| `express` v5        | HTTP framework                 |
| `@libsql/client`    | Turso/LibSQL database driver   |
| `zod` v4            | Schema validation              |
| `jsonwebtoken`      | JWT creation and verification  |
| `bcrypt`            | Password hashing               |
| `helmet`            | Security headers               |
| `cors`              | Cross-origin resource sharing  |
| `uuid`              | UUID generation for PKs        |
| `dotenv`            | Environment variable loading   |

### Frontend Dependencies

| Package                    | Purpose                        |
|----------------------------|--------------------------------|
| `react` v19                | UI library                     |
| `react-router-dom` v7     | Client-side routing            |
| `@tanstack/react-query` v5| Server state management        |
| `zustand` v5               | Client state management        |
| `axios`                    | HTTP client                    |
| `react-hook-form`          | Form state management          |
| `zod` v4                   | Form validation schemas        |
| `tailwindcss` v4           | Utility-first CSS              |
| `radix-ui/*`               | Headless UI primitives         |
| `lucide-react`             | Icon library                   |
| `sonner`                   | Toast notifications            |
| `date-fns`                 | Date utility functions         |
| `class-variance-authority` | Component variant management   |
