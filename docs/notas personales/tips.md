
## Regla simple

- Schema Types = Datos que entran de la API
- Entity Types = Datos que viven en tu aplicación
- Row Types = Datos como están en la base de datos

### Alias
Resuelto. El problema era que tsc no reescribe los path aliases (@/...) en el JavaScript de salida -- los deja tal cual. Node.js en runtime no sabe resolverlos.
Lo que hice:

1. Instalé tsc-alias como dependencia de desarrollo
2. Cambié el script build de "tsc" a "tsc && tsc-alias"
tsc-alias se ejecuta tras la compilación y reemplaza todos los @/... por rutas relativas reales (./, ../, etc.) en los .js generados en dist/.
Ya tenías tsconfig-paths/register para desarrollo (en dev y seed), así que esto completa el soporte de aliases para producción.
