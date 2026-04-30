# DEMO_TEMPORAL_V1_SPEC

## 1) Objetivo

Permitir acceso inmediato a la app sin registro mediante un usuario demo temporal, aislado por sesion de usuario, con expiracion automatica y limpieza de datos.

## 2) Alcance (V1)

Incluye:
- Boton "Probar demo" en login.
- Endpoint publico para crear/login demo temporal.
- JWT + refresh cookie igual que login normal.
- Restricciones para usuarios demo en acciones sensibles.
- Expiracion demo (TTL) y cleanup automatico.
- Banner visible de modo demo en frontend.

No incluye:
- Conversion de demo a cuenta real (queda para V2).

## 3) Decisiones clave

- Modelo: usuario demo unico por sesion (`isDemo = true`) con `demoExpiresAt`.
- Duracion demo: 24 horas.
- Rol: mantener `role = 'user'` (sin crear `guest` en V1), controlar por flag `isDemo`.
- Seguridad: nunca exponer credenciales demo en frontend.
- Limpieza: job periodico + limpieza oportunista al crear demo.

## 4) Cambios de backend

### 4.1 Base de datos
Tabla `users`:
- `is_demo` BOOLEAN NOT NULL DEFAULT 0
- `demo_expires_at` DATETIME NULL

Indices recomendados:
- `idx_users_is_demo_expires_at (is_demo, demo_expires_at)`

### 4.2 Tipos y mapeo
Actualizar:
- `backend/src/types/entities/user.types.ts`
- `backend/src/repositories/user.repository.ts`
- incluir `isDemo`, `demoExpiresAt` en dominio y mapping snake_case/camelCase.

### 4.3 Endpoint nuevo
`POST /users/demo-login` (publico)

Comportamiento:
1. Crea usuario demo temporal (email random unico, nombre "Demo User", password aleatoria no reutilizable).
2. Asigna `is_demo = 1`, `demo_expires_at = now + 24h`.
3. Genera token pair (access + refresh), setea cookie refresh.
4. Responde igual que login normal:
   - `{ user, accessToken }`

### 4.4 Servicio
Agregar en `user.service.ts`:
- `createDemoUserAndLogin()`

Validaciones:
- Si falla creacion de usuario o token, devolver AppError normalizado.
- Registrar security event tipo `login_demo` (si aplica al repositorio actual de eventos).

### 4.5 Middleware demo
Nuevo middleware:
- `requireActiveDemoOrUser` (si ya hay `requireAuth`, extender chequeo de expiracion demo).
- `forbidDemoUser` para rutas sensibles.

Bloquear demo en:
- cambio de password
- update de campos sensibles de usuario (email/password/role)
- endpoints administrativos (ya quedan fuera por role user)

Permitir demo en:
- workout templates/sessions
- personal records
- ejercicios lectura

### 4.6 Expiracion + cleanup
- En cada request autenticada: si `isDemo` y `demoExpiresAt < now` => 401 con error explicito (`DEMO_EXPIRED`).
- Job periodico cada 6h:
  - soft/hard delete de usuarios demo expirados (segun estrategia elegida).
  - borrado en cascada de datos asociados.

## 5) Cambios de frontend

### 5.1 API
En `frontend/src/api/endpoints/auth.ts`:
- `loginDemo(): Promise<AuthResponse>` -> `POST /users/demo-login`
- guardar `accessToken` y `user` igual que login normal.

### 5.2 Store
En `frontend/src/store/authStore.ts`:
- `loginDemo(): Promise<void>`
- flujo igual a `login`, con manejo de errores propio.

### 5.3 UI Login
En `frontend/src/features/auth/pages/LoginPage.tsx`:
- boton secundario "Probar demo".
- loading independiente para evitar doble submit.

### 5.4 Estado visual demo
- Banner persistente global cuando `user.isDemo === true`:
  - texto: "Estas en modo demo. Tus datos expiran en 24h."
- CTA visible: "Crear cuenta y guardar mi progreso" (sin implementar conversion aun, solo navegacion/placeholder).

### 5.5 Manejo expiracion
Si API responde `DEMO_EXPIRED`:
- limpiar sesion local
- redirigir a `/login`
- mensaje claro: "Tu sesion demo expiro. Puedes iniciar otra demo o registrarte."

## 6) Criterios de aceptacion

1. Desde login, el usuario entra con un click sin registro.
2. Cada entrada demo crea identidad aislada (no comparte datos con otros demos).
3. El usuario demo puede usar funcionalidades principales de tracking.
4. Las rutas sensibles bloquean usuario demo correctamente.
5. Al expirar la demo, no puede seguir operando.
6. Datos demo expirados se limpian automaticamente.
7. No hay credenciales demo hardcodeadas en frontend.

## 7) Riesgos y mitigaciones

- Crecimiento de datos demo:
  - mitigacion: TTL + cleanup periodico + limites de rate.
- Abuso del endpoint demo:
  - mitigacion: rate limit por IP, fingerprint basico opcional.
- Confusion de usuario final:
  - mitigacion: banner permanente + CTA de registro.
