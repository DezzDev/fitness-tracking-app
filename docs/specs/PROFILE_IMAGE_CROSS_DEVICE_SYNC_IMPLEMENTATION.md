# PROFILE_IMAGE_CROSS_DEVICE_SYNC_IMPLEMENTATION

## 1) Objetivo

Asegurar que cambios de perfil (especialmente `profileImage`) se reflejen correctamente en:
- Reingreso a la app tras dias sin uso
- Foco/visibilidad de la app
- Otras pestañas del mismo navegador

Sin implementar realtime server push (WebSocket/SSE) por ahora.

---

## 2) Problema actual

- El estado de usuario se hidrata principalmente desde `localStorage`.
- `loadUser()` no revalida contra backend.
- La cabecera (`DashboardLayout`) usa `user` de Zustand, que puede quedar stale.
- Cambios hechos en otro dispositivo no se ven hasta re-login/refresh manual.
- Entre pestañas no hay sincronizacion explícita del estado de auth.

---

## 3) Alcance

Incluye:
1. Rehidratacion remota de usuario autenticado (`GET /users/me`) al iniciar app.
2. Refetch al volver la app a foco/visible.
3. Sincronizacion entre pestañas usando evento `storage`.
4. Unificacion de actualizacion de `localStorage` y store.
5. Manejo seguro de expiracion/token invalido.

No incluye:
- Realtime cross-device con sockets/SSE.
- Cambios backend.

---

## 4) Diseño tecnico

### 4.1 Store de auth (`frontend/src/store/authStore.ts`)

Agregar acciones:

- `hydrateUserFromServer: () => Promise<void>`
  - Si no hay token, salir sin hacer nada.
  - Llamar `authApi.getProfile()` (o `usersApi.getProfile()`).
  - En exito: actualizar `user`, `isAuthenticated`, `accessToken` y persistencia local.
  - En 401: limpiar sesion (`user=null`, token null, `isAuthenticated=false`).

- `syncUserFromStorage: () => void`
  - Leer `localStorage.user`.
  - Actualizar `user` en store para reflejar cambios de otra pestaña.

Mejoras:
- Mantener `loadUser()` para bootstrap local rapido.
- Encadenar `loadUser()` + `hydrateUserFromServer()` desde layout.

---

### 4.2 Endpoints (`frontend/src/api/endpoints/auth.ts`, `frontend/src/api/endpoints/users.ts`)

Unificar persistencia de usuario:
- Cada lectura/actualizacion de perfil debe mantener `localStorage.user` consistente.
- Definir helper interno para evitar duplicacion:
  - `persistUser(user: User)`.

Aplicar en:
- `authApi.getProfile()`
- `usersApi.getProfile()`
- (ya existe en update/upload/delete de imagen; mantenerlo consistente).

---

### 4.3 Root layout (`frontend/src/components/layouts/RootLayout.tsx`)

Al montar:
1. `loadUser()`
2. `hydrateUserFromServer()` (sin bloquear render principal)

Listeners:
- `visibilitychange`: cuando `document.visibilityState === 'visible'`, ejecutar `hydrateUserFromServer()`.
- `focus`: ejecutar `hydrateUserFromServer()`.

Opcional recomendado:
- Throttle (p.ej. 60s) para evitar llamadas repetidas innecesarias.

Cleanup:
- remover listeners en `useEffect` cleanup.

---

### 4.4 Sincronizacion entre pestañas

En `RootLayout` (o en hook dedicado):
- Escuchar `window.addEventListener('storage', ...)`.
- Si `event.key === 'user'`:
  - llamar `syncUserFromStorage()`.
- Si `event.key === 'accessToken'` y queda vacio:
  - reflejar logout en store.

---

### 4.5 Header/avatar (`frontend/src/components/layouts/DashboardLayout.tsx`)

Sin cambios estructurales:
- Mantener lectura de `useAuthStore().user`.
- Con el refetch/sync, el avatar se actualiza automaticamente.

---

## 5) Flujo esperado final

1. Usuario abre app en dispositivo A -> se carga local + se valida con backend.
2. Cambia foto en dispositivo B.
3. Usuario vuelve a A (foco/visible) -> `hydrateUserFromServer()` trae foto nueva.
4. Si hay dos pestañas en A, una actualiza perfil -> otra pestaña se sincroniza por `storage`.

---

## 6) Criterios de aceptacion

1. Al abrir la app autenticado, se sincroniza perfil con backend.
2. Al volver la pestaña a foco/visible, se refresca `profileImage`.
3. En dos pestañas del mismo navegador, cambios de perfil se reflejan en ambas.
4. Ante token invalido/expirado, estado local se limpia correctamente.
5. No se introducen regresiones en login/logout/demo flow.

---

## 7) Verificacion manual

1. Login en dispositivo A.
2. Cambiar imagen desde dispositivo B.
3. Volver a A (foco/visible): avatar debe actualizarse.
4. Abrir dos pestañas en A, cambiar imagen en una: la otra debe reflejar cambio.
5. Invalidar sesion y volver a foco: debe limpiar auth y redirigir a login segun interceptor.

---

## 8) Riesgos y mitigaciones

- Exceso de requests en cambios frecuentes de foco:
  - mitigacion: throttle.
- Condiciones de carrera entre interceptores/store:
  - mitigacion: centralizar persistencia en helper.
- Estado inconsistente entre cache/store/localStorage:
  - mitigacion: definir fuente de verdad y unificar puntos de escritura.