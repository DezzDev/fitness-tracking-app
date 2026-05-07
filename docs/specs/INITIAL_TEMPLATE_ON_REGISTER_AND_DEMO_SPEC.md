# INITIAL_TEMPLATE_ON_REGISTER_AND_DEMO_SPEC

## 1) Objetivo

Garantizar que todo usuario nuevo (registrado o demo) tenga una plantilla inicial creada automaticamente al entrar a la app.

## 2) Regla de negocio

- Se crea una plantilla base para:
  - Registro normal (`POST /users/register`)
  - Login demo (`POST /users/demo-login`)
- Si falla la creacion de la plantilla, tambien debe fallar el flujo de registro/login demo.
- No se crea sesion historica; solo plantilla inicial.

## 3) Plantilla inicial

- Nombre: `Rutina Inicial`
- Dia programado: dia actual con conversion interna:
  - `scheduledDayOfWeek = (new Date().getDay() + 6) % 7` (0=Lunes, 6=Domingo)
- Ejercicios (orden fijo):
  1. Dominadas pronas — `916135f4-4e11-43df-831e-5715f86879ad`
  2. Flexiones — `658805c3-58d9-4a85-befb-fe373d1495bd`
  3. Sentadillas — `f4d965c4-6b02-4917-89bc-b63cde23fa03`
  4. Crunch abdominal — `dcd18278-8e0d-4ead-b741-71b426df463e`
- Sets/reps iniciales:
  - Dominadas pronas: 3x6
  - Flexiones: 3x12
  - Sentadillas: 3x15
  - Crunch abdominal: 3x20

## 4) Diseno tecnico

### 4.1 Backend (servicio de usuario)

Helper privado reutilizable en `user.service.ts`:

- `createInitialTemplateForUser(userId: string): Promise<void>`

Responsabilidades:
- Construir payload `CreateWorkoutTemplateInput` con la rutina definida.
- Invocar `workoutTemplateService.create(userId, payload)`.
- Propagar errores para que el flujo superior falle.

### 4.2 Puntos de integracion

En `user.service.ts`:

- `register(...)`:
  1. Crear usuario
  2. Crear plantilla inicial (obligatorio)
  3. Generar token/retornar respuesta

- `demoLogin(...)`:
  1. Crear usuario demo
  2. Crear plantilla inicial (obligatorio)
  3. Generar tokens/retornar respuesta

### 4.3 Manejo de errores

- Si falla creacion de plantilla:
  - Lanzar `AppError`/`handleServiceError`
  - No continuar con login exitoso
- Resultado esperado: API responde error y el usuario no entra.

## 5) Impacto frontend

No requiere cambios funcionales:
- El dashboard ya usa `GET /workoutTemplates/today`.
- Al ingresar, deberia mostrarse automaticamente la rutina inicial.

## 6) Criterios de aceptacion

1. Usuario registrado nuevo entra y tiene `Rutina Inicial`.
2. Usuario demo nuevo entra y tiene `Rutina Inicial`.
3. La plantilla contiene exactamente los 4 ejercicios indicados y en el orden definido.
4. Si la creacion de plantilla falla, falla registro/login demo.
5. No se crean sesiones historicas automaticamente.