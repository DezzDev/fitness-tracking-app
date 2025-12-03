# Documentación: Estructura del proyecto

Este documento describe la estructura del repositorio `fitness-tracker-app`, explicando carpetas y archivos principales, su finalidad y puntos de interés para el desarrollo y pruebas.

**Resumen rápido**
- Proyecto fullstack con carpetas principales `backend/` y `frontend/`.
- `backend/` contiene la API en TypeScript con tests y utilidades.
- `frontend/` contiene la app cliente (Vite + React + TypeScript).
- Documentación y scripts auxiliares en la raíz y carpetas `documents/` y `requests/`.

**Estructura de alto nivel**
- `backend/`: Servidor (Node + TypeScript)
  - `package.json`: dependencias y scripts del backend.
  - `tsconfig.json`: configuración TypeScript del backend.
  - `src/`: código fuente del servidor.
    - `index.ts`: punto de entrada de la aplicación.
    - `config/`: configuración (e.g. `database.ts`, `env.ts`).
    - `controllers/`: controladores de rutas (`user.controller.ts`, `workout.controller.ts`, `exercise.controller.ts`).
    - `routes/`: definición de rutas (`user.routes.ts`, `workout.routes.ts`, `exercise.routes.ts`, `tag.routes.ts`).
    - `services/`: lógica de negocio (`user.service.ts`, `workout.service.ts`, `exercise.service.ts`).
    - `repositories/`: acceso a datos (`user.repository.ts`, `workout.repository.ts`, `exercise.repository.ts`).
    - `schemas/`: validaciones/esquemas (`user.schema.ts`, `workout.schema.ts`, `exercise.schema.ts`).
    - `middlewares/`: middlewares (`auth.middleware.ts`, `authorize.middleware.ts`, `validate.middleware.ts`, `error.middleware.ts`).
    - `utils/`: utilidades (`jwt.utils.ts`, `error.utils.ts`, `logger.ts`, `response.ts`).
    - `test-utils/`: helpers y fixtures para tests (`fixtures.ts`, `helpers.ts`, `setup.ts`).
    - `types/`: definiciones de tipos y augmentaciones de Express (`express.d.ts`, `index.ts`, subcarpetas `common/` y `entities/`).
    - `script/`: scripts auxiliares (`seeding.data.ts`).
  - `__tests__/`: pruebas organizadas por tipo
    - `unit/`, `integration/`, `e2e/` con tests específicos (p.ej. `user.service.test.ts`, `auth.test.ts`).
  - `public/`: recursos estáticos del backend (imágenes, etc.).
  - `requests/`: colecciones de peticiones (formato `.http`) para probar endpoints manualmente.
  - `eslint.config.mjs`, `jest.config.js`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`: herramientas, configuración de lint y test, y lockfile.

- `frontend/`: Aplicación cliente (Vite + React + TypeScript)
  - `package.json`: dependencias y scripts del frontend.
  - `vite.config.ts`: configuración del bundler.
  - `index.html`, `public/`, `src/`: código y activos del cliente.
    - `src/main.tsx`: punto de entrada.
    - `src/App.tsx`, `src/App.css`: componente App.
    - `src/assets/`: imágenes y otros activos.
  - `tsconfig.*.json`: configuraciones TypeScript específicas del frontend.

- `documents/`: documentación del proyecto y notas técnicas (`tables.md`, `layers.md`, `tips.md`, etc.).
- `WARP.md`: (probablemente notas de WARP o documentación superior).
- `readme.md` (en `backend/`) y `frontend/README.md`: instrucciones específicas por paquete.

**Archivos y carpetas de interés (detallado)**
- `backend/src/config/database.ts`: inicialización y configuración de la base de datos.
- `backend/src/middlewares/auth.middleware.ts`: middleware de autenticación JWT.
- `backend/src/utils/jwt.utils.ts`: creación y verificación de tokens.
- `backend/src/services/user.service.ts`: lógica relacionada con usuarios.
- `backend/__tests__/`: contiene pruebas unitarias, de integración y e2e; revisar `test-utils/setup.ts` para ver cómo se configura el entorno de pruebas.
- `frontend/src/main.tsx`: bootstrap de la app React; revisar `vite.config.ts` para proxies o aliases.

**Convenciones y buenas prácticas observadas**
- Tests organizados por `unit`, `integration` y `e2e`.
- Clear separation: `controllers` -> `services` -> `repositories`.
- Tipos centralizados en `src/types/` y `entities/` para consistencia.

**Cómo usar este documento**
- Referencia rápida para onboarding: copia las secciones relevantes para nuevos devs.
- Base para expandir documentación técnica (añadir diagramas, flujos, y contratos API).

**Siguientes pasos recomendados**
- Añadir un índice de endpoints y ejemplos de request/response en `documents/` o en `backend/readme.md`.
- Mantener actualizado este archivo cuando se agreguen nuevas carpetas o se reestructure el código.

---
Documento generado automáticamente: `DOCUMENTACION_ESTRUCTURA_PROYECTO.md`.
