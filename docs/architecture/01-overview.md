# Overview & High-Level Architecture

## 1. Overview

Full-stack fitness tracking application built with a clear separation between backend API and frontend SPA. Both projects are independent (no monorepo root) and use **pnpm** as package manager.

```
fitness-tracker-app/
├── backend/          # Node.js + Express 5 + TypeScript (REST API)
├── frontend/         # Vite 7 + React 19 + TypeScript (SPA)
├── docs/             # Project documentation
└── AGENTS.md         # Agent guidelines
```

| Layer    | Stack                                                       |
|----------|-------------------------------------------------------------|
| Backend  | Node.js, Express 5, TypeScript, Zod v4, JWT, bcrypt         |
| Frontend | Vite 7, React 19, TypeScript, Tailwind CSS v4, shadcn/ui    |
| Database | Turso (cloud LibSQL/SQLite) via `@libsql/client` -- raw SQL |
| State    | Zustand v5 (client), React Query v5 (server)                |

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (SPA)                      │
│  React 19 + Vite 7 + TypeScript                         │
│                                                         │
│  ┌──────────┐   ┌──────────┐  ┌────────────┐             │
│  │ Zustand  │   │  React   │  │  React     │             │
│  │ (Auth)   │   │  Query   │  │  Router v7 │             │
│  └────┬─────┘   └────┬─────┘  └─────┬──────┘             │
│       │              │              │                    │
│  ┌────▼──────────────▼──────────────▼───────┐            │
│  │          API Layer (Axios)               │            │
│  │   client.ts + endpoints/*.ts             │            │
│  └────────────────┬─────────────────────────┘            │
└───────────────────┼──────────────────────────────────────┘
                    │ HTTP (JSON)
                    │ Authorization: Bearer <JWT>
┌───────────────────▼──────────────────────────────────────┐
│                     BACKEND (API)                        │
│  Express 5 + TypeScript                                  │
│                                                          │
│  ┌──────────┐  ┌────────────┐  ┌───────────┐             │
│  │  Routes  │─▶│ Controllers│─▶│ Services  │             │
│  │  + MW    │  │  (thin)    │  │ (logic)   │             │
│  └──────────┘  └────────────┘  └─────┬─────┘             │
│                                      │                   │
│                               ┌──────▼──────┐            │
│                               │Repositories │            │
│                               │ (raw SQL)   │            │
│                               └──────┬──────┘            │
└──────────────────────────────────────┼───────────────────┘
                                       │
                                ┌──────▼──────┐
                                │    Turso    │
                                │  (LibSQL)   │
                                └─────────────┘
```
