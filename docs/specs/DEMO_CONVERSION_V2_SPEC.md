# DEMO_CONVERSION_V2_SPEC

## 1) Objetivo

Permitir que un usuario en modo demo convierta su cuenta temporal a una cuenta permanente sin perder su progreso (workouts, templates, PRs, etc.).

## 2) Alcance (V2)

Incluye:
- Endpoint autenticado para conversion demo -> cuenta real.
- Validacion de email/credenciales.
- Migracion in-place de identidad (mismo `user_id`) para conservar datos.
- UX de conversion desde banner/CTA.
- Reemision de tokens tras conversion.

No incluye:
- Flujos de verificacion por email (opcional para V3).

## 3) Decisiones clave

- Estrategia de migracion: **in-place** (no crear usuario nuevo + copiar data).
- Ventaja: evita migraciones complejas en todas las tablas con `user_id`.
- Conversion solo permitida si `isDemo = true` y no expirado.
- Al convertir:
  - `is_demo = 0`
  - `demo_expires_at = NULL`
  - email/password/name/age reales
  - revocar sesiones previas demo y emitir nuevos tokens.

## 4) Cambios de backend

### 4.1 Endpoint nuevo
`POST /users/convert-demo` (requiere auth)

Body:
- `email`
- `password`
- `name`
- `age`
- `acceptTerms`

### 4.2 Validaciones
- Usuario autenticado debe ser demo activo.
- Email no debe existir.
- Password debe cumplir reglas actuales.
- Si demo expirada: error `DEMO_EXPIRED`.

### 4.3 Servicio de conversion
Agregar en `user.service.ts`:
- `convertDemoToRegistered(userId, input)`

Flujo:
1. Buscar usuario actual por `userId`.
2. Verificar `isDemo === true`.
3. Verificar unicidad email.
4. Hash de password.
5. Update transaccional del usuario:
   - email, name, age, password_hash
   - `is_demo = 0`
   - `demo_expires_at = NULL`
   - `updated_at = now`
6. Incrementar `tokenVersion` (invalidate tokens viejos demo).
7. Generar nuevo token pair y devolver login response estandar.

### 4.4 Controller y schema
- Nuevo schema `ConvertDemoSchema` (puede vivir en `user.schema.ts`).
- Nuevo controller `convertDemo`.

### 4.5 Seguridad
- Rate limit en endpoint de conversion.
- Errores sin filtrar existencia detallada de cuentas mas alla de lo necesario.
- Audit event `demo_converted`.

## 5) Cambios de frontend

### 5.1 API y store
En `authApi`:
- `convertDemo(data)` -> `POST /users/convert-demo`
- actualizar token + user local.

En `authStore`:
- accion `convertDemoAccount(data)` con estado de carga/error.

### 5.2 UI/UX
- Desde banner demo: boton "Guardar mi progreso".
- Modal/form corto con:
  - nombre
  - edad
  - email
  - contrasena
  - aceptar terminos
- Al exito:
  - cerrar modal
  - toast de exito
  - mantener al usuario en su flujo actual (sin perder pantalla)

### 5.3 Fallback de V1
Si usuario no convierte y demo expira:
- se mantiene comportamiento de expiracion de V1.

## 6) Criterios de aceptacion

1. Usuario demo puede convertirse sin perder entrenamientos ni historial.
2. Tras convertir, `isDemo` queda en false y TTL removido.
3. Tokens demo previos quedan invalidos.
4. El usuario ya no ve banner de demo.
5. Si email ya existe, recibe error claro y no pierde sesion demo activa.
6. Conversion funciona en una sola operacion consistente.

## 7) Riesgos y mitigaciones

- Inconsistencias durante conversion:
  - mitigacion: operacion transaccional.
- Token stale post-conversion:
  - mitigacion: `tokenVersion++` + nuevos tokens.
- Friccion UX:
  - mitigacion: form minimo y CTA contextual en puntos de alto valor.
