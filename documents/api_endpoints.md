# Índice de Endpoints - API

Este documento ofrece un índice de los endpoints expuestos por la API en `backend/`, con método HTTP, ruta, middlewares principales, controlador responsable y ejemplos de request/response para los endpoints más relevantes.

Nota: las rutas listadas provienen de `backend/src/routes` (user, workout, exercise, tag).

---

## Usuarios (`/users`)

- POST /users/register
  - Auth: No
  - Middlewares: `validateBody(RegisterSchema)`
  - Controller: `userController.register`
  - Descripción: Registrar un nuevo usuario.
  - Ejemplo request:
    - Body (JSON):
      {
        "email": "juan@example.com",
        "password": "P@ssw0rd",
        "name": "Juan Perez"
      }
  - Ejemplo response (201 Created):
      {
        "id": "uuid",
        "email": "juan@example.com",
        "name": "Juan Perez"
      }

- POST /users/login
  - Auth: No
  - Middlewares: `validateBody(LoginSchema)`
  - Controller: `userController.login`
  - Descripción: Autenticar usuario y devolver token JWT.
  - Ejemplo request:
      {
        "email": "juan@example.com",
        "password": "P@ssw0rd"
      }
  - Ejemplo response (200 OK):
      {
        "token": "eyJhbGci...",
        "user": { "id": "uuid", "email": "juan@example.com", "name": "Juan Perez" }
      }

- GET /users/me
  - Auth: Sí (`requireAuth`)
  - Controller: `userController.getProfile`
  - Descripción: Obtener perfil del usuario autenticado.
  - Ejemplo response (200 OK):
      {
        "id": "uuid",
        "email": "juan@example.com",
        "name": "Juan Perez"
      }

- PATCH /users/me/password
  - Auth: Sí (`requireAuth`)
  - Middlewares: `validateBody(ChangePasswordSchema)`
  - Controller: `userController.changePassword`
  - Descripción: Cambiar contraseña del usuario autenticado.

- GET /users
  - Auth: Sí (`requireAuth`, `requireAdmin`)
  - Middlewares: `validateQuery(PaginationSchema)`
  - Controller: `userController.listUsers`
  - Descripción: Listar usuarios (admin).

- GET /users/:id
  - Auth: Sí (`requireAuth`, `requireAdmin`)
  - Middlewares: `validateParams(UserIdSchema)`
  - Controller: `userController.getUser`
  - Descripción: Obtener datos de un usuario por id (admin).

- PATCH /users/:id
  - Auth: Sí (`requireAuth`)
  - Middlewares: `validateParams(UserIdSchema)`, `validateBody(UpdateUserSchema)`
  - Controller: `userController.updateUser`
  - Descripción: Actualizar usuario.

- DELETE /users/softDelete/:id
  - Auth: Sí (`requireAuth`, `requireAdmin`)
  - Middlewares: `validateParams(UserIdSchema)`
  - Controller: `userController.softDeleteUser`
  - Descripción: Eliminación lógica (soft delete).

- DELETE /users/hardDelete/:id
  - Auth: Sí (`requireAuth`, `requireAdmin`)
  - Middlewares: `validateParams(UserIdSchema)`
  - Controller: `userController.hardDeleteUser`
  - Descripción: Eliminación física (hard delete).

---

## Workouts (`/workouts`)

> Nota: Todas las rutas en `workout.routes.ts` usan `router.use(requireAuth)` — requieren autenticación.

- GET /workouts/stats
  - Auth: Sí
  - Middlewares: `validateQuery(WorkoutFiltersSchema)`
  - Controller: `workoutController.getWorkoutStats`
  - Descripción: Obtener estadísticas de workouts del usuario.

- POST /workouts
  - Auth: Sí
  - Middlewares: `validateBody(CreateWorkoutSchema)`
  - Controller: `workoutController.createWorkout`
  - Descripción: Crear un nuevo workout.
  - Ejemplo request (201 Created):
    {
      "title": "Piernas - Fuerza",
      "date": "2025-12-01",
      "exercises": [ { "exerciseId": "uuid", "sets": 4, "reps": 8 } ]
    }

- GET /workouts
  - Auth: Sí
  - Middlewares: `validateQuery(WorkoutFiltersSchema)`
  - Controller: `workoutController.listWorkouts`
  - Descripción: Listar workouts (con filtros/paginación).

- GET /workouts/:id
  - Auth: Sí
  - Middlewares: `validateParams(WorkoutIdSchema)`
  - Controller: `workoutController.getWorkout`
  - Descripción: Obtener workout por id.

- PATCH /workouts/:id
  - Auth: Sí
  - Middlewares: `validateParams(WorkoutIdSchema)`, `validateBody(UpdateWorkoutSchema)`
  - Controller: `workoutController.updateWorkout`
  - Descripción: Actualizar workout.

- DELETE /workouts/:id
  - Auth: Sí
  - Middlewares: `validateParams(WorkoutIdSchema)`
  - Controller: `workoutController.deleteWorkout`
  - Descripción: Eliminar workout.

---

## Exercises (`/exercises`)

- GET /exercises/stats
  - Auth: No
  - Controller: `exerciseController.getExerciseStats`
  - Descripción: Obtener estadísticas globales de exercises.

- GET /exercises
  - Auth: No
  - Middlewares: `validateQuery(ExerciseFiltersSchema)`
  - Controller: `exerciseController.listExercises`
  - Descripción: Listar exercises con filtros.

- GET /exercises/:id
  - Auth: No
  - Middlewares: `validateParams(ExerciseIdSchema)`
  - Controller: `exerciseController.getExercise`
  - Descripción: Obtener exercise por id.

- POST /exercises
  - Auth: Sí (`requireAuth`, `authorize('admin')`)
  - Middlewares: `validateBody(CreateExerciseSchema)`
  - Controller: `exerciseController.createExercise`
  - Descripción: Crear nuevo exercise (admin).

- PATCH /exercises/:id
  - Auth: Sí (`requireAuth`, `authorize('admin')`)
  - Middlewares: `validateParams(ExerciseIdSchema)`, `validateBody(UpdateExerciseSchema)`
  - Controller: `exerciseController.updateExercise`
  - Descripción: Actualizar exercise (admin).

- DELETE /exercises/:id
  - Auth: Sí (`requireAuth`, `authorize('admin')`)
  - Middlewares: `validateParams(ExerciseIdSchema)`
  - Controller: `exerciseController.deleteExercise`
  - Descripción: Eliminar exercise (admin).

---

## Tags (`/tags`)

- GET /tags
  - Auth: No
  - Controller: `exerciseController.listTags`
  - Descripción: Listar tags.

- GET /tags/:id
  - Auth: No
  - Middlewares: `validateParams(TagIdSchema)`
  - Controller: `exerciseController.getTag`
  - Descripción: Obtener tag por id.

- POST /tags
  - Auth: Sí (`requireAuth`, `authorize('admin')`)
  - Middlewares: `validateBody(CreateTagSchema)`
  - Controller: `exerciseController.createTag`
  - Descripción: Crear tag (admin).

- DELETE /tags/:id
  - Auth: Sí (`requireAuth`, `authorize('admin')`)
  - Middlewares: `validateParams(TagIdSchema)`
  - Controller: `exerciseController.deleteTag`
  - Descripción: Eliminar tag (admin).

---

## Notas adicionales

- Validaciones: La mayoría de endpoints usan middlewares de validación (`validateBody`, `validateParams`, `validateQuery`) con los esquemas definidos en `backend/src/schemas`.
- Autenticación: `requireAuth` protege rutas privadas; la autorización de roles se gestiona mediante `authorize` o `requireAdmin`.
- Ejemplos: Los ejemplos incluidos son ilustrativos; consultar los esquemas (`*.schema.ts`) para los campos exactos y tipos.

---

Si quieres, puedo:
- Añadir ejemplos completos (body + response + códigos de error) para cada endpoint.
- Generar una tabla CSV/JSON con el índice para consumirlo en documentación automática (Swagger/OpenAPI).
- Integrar un archivo `openapi.yaml` o `swagger.json` básico con estas rutas.

Indica qué prefieres y lo preparo.