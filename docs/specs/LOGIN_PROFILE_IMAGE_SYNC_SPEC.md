# LOGIN_PROFILE_IMAGE_SYNC_SPEC

## 1) Objetivo

Corregir la inconsistencia de `profileImage` al hacer login, asegurando que el backend incluya ese campo en la respuesta de autenticacion.

## 2) Problema identificado

Actualmente, el flujo de login usa `findByEmailWithPassword` en backend, pero esa query no selecciona `profile_image`.  
Como el mapper de usuario espera ese campo, termina devolviendo `profileImage: null` en la respuesta de login, aunque el usuario si tenga imagen guardada.

## 3) Alcance

Incluye:
- Ajustar query de login para incluir `profile_image`.
- Mantener compatibilidad con flujo actual de auth.
- Verificar build backend y frontend.

No incluye:
- Realtime cross-device con sockets/SSE.
- Cambios de arquitectura de auth.

## 4) Diseño tecnico

### 4.1 Archivo a modificar
- `backend/src/repositories/user.repository.ts`

### 4.2 Cambio puntual
En `queries.findByEmailWithPassword.sql`, agregar `profile_image` al SELECT.

Antes:
- `id, email, name, age, role, is_active, is_demo, demo_expires_at, created_at, updated_at, token_version, password_hash`

Depois:
- `id, email, name, age, role, is_active, is_demo, demo_expires_at, profile_image, created_at, updated_at, token_version, password_hash`

### 4.3 Impacto esperado
- `userService.login()` devolvera `user.profileImage` correctamente en login.
- Frontend mostrara avatar actualizado sin necesitar refresh manual post-login.

## 5) Criterios de aceptacion

1. Usuario con imagen existente hace login y recibe `profileImage` no nulo.
2. Avatar se muestra correctamente tras login sin refresh manual.
3. No se rompen login demo, refresh token ni logout.
4. Build backend compila sin errores.

## 6) Verificacion manual

1. Actualizar imagen de perfil para un usuario.
2. Cerrar sesion.
3. Hacer login de nuevo.
4. Confirmar que la respuesta de login contiene `profileImage`.
5. Confirmar que UI muestra avatar correcto inmediatamente.