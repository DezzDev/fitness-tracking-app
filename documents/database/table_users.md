# TABLAS

## Tabla: Users

La tabla users almacena la información principal de los usuarios registrados en la aplicación Fitness Tracker (Calistenia).
Su diseño garantiza integridad de datos, seguridad y escalabilidad, manteniendo la simplicidad necesaria para aplicaciones móviles o web.

## Estructura de la tabla

``` sql
CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	email TEXT UNIQUE NOT NULL CHECK(email LIKE '%@%.__%'),
	age INTEGER NOT NULL CHECK(age BETWEEN 10 AND 120),
	password_hash TEXT NOT NULL,
	role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
	name TEXT,
	profile_image TEXT,
	is_active BOOLEAN NOT NULL DEFAULT 1,
	acceptTerms BOOLEAN NOT NULL CHECK(acceptTerms = 1), 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Descripción de los campos

| Campo             | Tipo       | Restricciones                                              | Descripción                                                                                                                        |
| ----------------- | ---------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **id**            | `INTEGER`  | `PRIMARY KEY AUTOINCREMENT`                                | Identificador único de cada usuario. Se genera automáticamente.                                                                    |
| **email**         | `TEXT`     | `UNIQUE NOT NULL CHECK(email LIKE '%@%.__%')`              | Correo electrónico único, utilizado como identificador principal para el inicio de sesión. El `CHECK` evita valores no válidos.    |
| **age**           | `INTEGER`  | `NOT NULL CHECK(age BETWEEN 10 AND 120)`                   | Edad del usuario. Se valida para asegurar que esté dentro de un rango razonable.                                                   |
| **password_hash** | `TEXT`     | `NOT NULL`                                                 | Contraseña en formato **hash** seguro (bcrypt o Argon2). Nunca se almacena en texto plano.                                         |
| **role**          | `TEXT`     | `NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin'))` | Define el rol del usuario dentro del sistema. Por defecto, todos son `user`, pero puede haber administradores.                     |
| **display_name**  | `TEXT`     | *(Opcional)*                                               | Nombre público del usuario, mostrado en la app (ranking, perfil, comentarios, etc.).                                               |
| **profile_image** | `TEXT`     | *(Opcional)*                                               | URL o ruta de la imagen de perfil del usuario. Puede almacenarse localmente o en un servicio externo (Cloudflare, Supabase, etc.). |
| **is_active**     | `BOOLEAN`  | `NOT NULL DEFAULT 1`                                       | Indica si la cuenta está activa (`1`) o desactivada (`0`). Permite bajas lógicas sin eliminar datos.                               |
| **acceptTerms**   | `BOOLEAN`  | `NOT NULL CHECK(acceptTerms = 1)`                          | Verifica que el usuario haya aceptado los términos y condiciones al registrarse.                                                   |
| **created_at**    | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP`                                | Fecha y hora de creación del registro. Se establece automáticamente.                                                               |
| **updated_at**    | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP`                                | Fecha de la última modificación del registro. Se actualiza mediante un *trigger*.                                                  |


## Trigger: actualización automática del campo updated_at
El siguiente trigger garantiza que el campo updated_at se actualice automáticamente cada vez que el registro cambie.

``` sql
CREATE TRIGGER IF NOT EXISTS update_users_updated_at
AFTER UPDATE ON users
BEGIN
  UPDATE users
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;
```

### Explicación paso a paso

1. AFTER UPDATE ON users
Se ejecuta automáticamente cada vez que se actualiza una fila en la tabla users.

2. UPDATE users SET updated_at = CURRENT_TIMESTAMP
Modifica el campo updated_at del registro actualizado para reflejar la hora actual.

3. WHERE id = NEW.id
Asegura que solo se actualice la fila modificada, no toda la tabla.

✅ Ventaja:
Mantiene una trazabilidad automática sin requerir lógica adicional en el backend.

## Índice: idx_users_email

Aunque el campo email ya cuenta con una restricción UNIQUE, se define este índice adicional para optimizar el rendimiento en consultas frecuentes, especialmente las de autenticación y validación de usuarios.

``` sql
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

### Beneficios

- Acelera las búsquedas por correo electrónico (WHERE email = ?).

- Mejora la eficiencia de validaciones al registrar nuevos usuarios.

- Reduce la carga de lectura cuando la base crece.

## Buenas prácticas aplicadas

1. Integridad de datos

	- Uso de CHECK, UNIQUE y NOT NULL en campos críticos.

2. Seguridad

	- Contraseñas cifradas y sin almacenamiento en texto plano.

3. Auditoría

	- Campos created_at y updated_at gestionados automáticamente.

4. Escalabilidad

	- Índices definidos para mejorar rendimiento en entornos con muchos usuarios.

5. Simplicidad

	- Diseño optimizado para Turso/SQLite, sin redundancia innecesaria.

## Relaciones futuras

| Tabla relacionada | Tipo de relación | Clave foránea | Descripción                           |
| ----------------- | ---------------- | ------------- | ------------------------------------- |
| `workouts`        | 1:N              | `user_id`     | Entrenamientos creados por el usuario |
| `goals`           | 1:N              | `user_id`     | Metas personales o PRs                |
| `exercise_logs`   | 1:N              | `user_id`     | Historial de ejercicios realizados    |

