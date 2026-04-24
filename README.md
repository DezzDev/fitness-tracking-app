# Fitness Tracking App

Aplicacion full-stack para seguimiento de entrenamiento fisico: registro de usuarios, ejercicios, plantillas de rutina, sesiones de entrenamiento y records personales.

## Tech Stack

- **Backend:** Node.js, Express 5, TypeScript, Zod, JWT, Turso (LibSQL)
- **Frontend:** React 19, Vite 7, TypeScript, Tailwind CSS v4, shadcn/ui
- **Estado en frontend:** React Query + Zustand
- **Base de datos:** Turso (`@libsql/client`) con SQL directo (sin ORM)

## Estructura del proyecto

```bash
fitness-tracking-app/
|- backend/      # API REST con Express + TypeScript
|- frontend/     # App web con React + Vite
|- docs/         # Documentacion tecnica y decisiones (ADRs)
`- AGENTS.md     # Guia del proyecto para agentes
```

## Requisitos previos

- **Node.js** 20+
- **pnpm** 10+
- Cuenta/proyecto en **Turso** (URL + auth token)

## Instalacion

Clona el repositorio y luego instala dependencias por separado:

```bash
# Backend
cd backend
pnpm install

# Frontend
cd ../frontend
pnpm install
```

## Variables de entorno

Crea `backend/.env`:

```env
NODE_ENV=development
PORT=3000

TURSO_DATABASE_URL=libsql://tu-db.turso.io
TURSO_AUTH_TOKEN=tu_token_turso

LOG_LEVEL=info

JWT_ACCESS_SECRET=tu_access_secret
JWT_REFRESH_SECRET=tu_refresh_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

COOKIE_SECURE=false
COOKIE_DOMAIN=localhost

# Opcional para CORS en produccion:
# ALLOWED_ORIGINS=https://tu-frontend.com
```

Crea `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

## Ejecutar en desarrollo

Abre dos terminales:

```bash
# Terminal 1 - Backend
cd backend
pnpm run dev
```

```bash
# Terminal 2 - Frontend
cd frontend
pnpm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Health check: `http://localhost:3000/health`

## Scripts principales

### Backend (`/backend`)

- `pnpm run dev` - servidor en desarrollo (hot reload)
- `pnpm run build` - compilacion TypeScript a `dist/`
- `pnpm run start` - ejecutar build de produccion
- `pnpm run seed` - seeding de datos

Tambien existen scripts de test:
- `pnpm run test`
- `pnpm run test:unit`
- `pnpm run test:integration`
- `pnpm run test:e2e`
- `pnpm run test:coverage`

### Frontend (`/frontend`)

- `pnpm run dev` - Vite dev server
- `pnpm run build` - type-check + build
- `pnpm run lint` - ESLint
- `pnpm run preview` - preview del build

## Arquitectura

### Backend (Layered Architecture)

```text
Routes -> Controllers -> Services -> Repositories -> Database
```

- **Routes:** endpoints y middlewares
- **Controllers:** capa HTTP
- **Services:** logica de negocio
- **Repositories:** consultas SQL y mapeo de datos

### Frontend (Feature-Based)

- `features/` por dominio (auth, exercises, profile, workouts)
- `api/` para cliente Axios y endpoints
- `store/` para estado global (Zustand)
- `lib/queryClient.ts` para configuracion React Query

## Endpoints principales

Base URL: `http://localhost:3000/api`

- **Users/Auth:** registro, login, perfil, actualizacion, cambio de contrasena
- **Exercises:** listado, detalle, filtros, stats
- **Tags:** CRUD basico
- **Personal Records:** CRUD + stats
- **Workout Templates:** CRUD, duplicar, favorito, plantilla de hoy
- **Workout Sessions:** CRUD, por rango de fecha, recientes, desde plantilla
- **Health:** `GET /health`

Para detalle completo, revisar:
- `backend/endpoints.md`
- `docs/endpoints.md`
- `AGENTS.md` (seccion de endpoints)

## Estado del proyecto

Proyecto en evolucion activa.
La base de tests esta preparada en backend, pero puede haber areas aun en implementacion o ajuste.

## Documentacion util

- `PROJECT_STRUCTURE.md`
- `docs/architecture/architecture.md`
- `docs/decisions/README.md`
- `AGENTS.md`

## Autor

- **Daniel Z**
