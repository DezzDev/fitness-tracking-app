---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

Fitness Tracker App – Documentación de Diseño y Arquitectura
1️⃣ Stack y Tecnologías

Bundler / Starter: Vite

UI: React

Tipado: TypeScript

Estilos: Tailwind CSS

Router: react-router-dom

Diseño Mobile-First: Principalmente para móvil, adaptaciones para escritorio.

2️⃣ Estética y estilo visual

Tema general: Dark & Sophisticated (oscuro y sofisticado)

Fondo principal: #121212 (casi negro)

Texto principal: #E0E0E0 (gris claro, legible)

Acento cálido: #FF6F3C (naranja intenso, botones y highlights)

Acento secundario: #FFC18E (microdetalles, interacciones)

Bordes / sombras: tonos cálidos semi-transparentes (rgba(255,111,60,0.25))

Tipografía:

Display / headings / nombres de ejercicios: tipografía experimental y dominante (Monument Extended, Blender Pro, etc.)

Cuerpo / métricas secundarias: legible pero contrastante (Space Mono, Roboto Slab)

Animaciones y microinteracciones:

Feedback rápido y contundente, estilo videojuego.

Botones que “golpean” al hacer click (active:scale-95).

Transiciones entre ejercicios rápidas y directas, con swipe o avance visual.

Evitamos animaciones largas y suaves; priorizamos sensación de acción inmediata.

3️⃣ Funcionalidad principal y gamificación

Se elimina: nivel, XP total y logros desbloqueables.

Foco absoluto en sesión de hoy y métricas de entrenamiento inmediatas.

Gamificación abstracta y elegante: sensación de progreso y control sin iconografía RPG o infantil.

Microfeedback visual directo al completar sets o ejercicios.

4️⃣ Páginas de la app
4.1 Dashboard principal

Propósito: Mostrar la sesión de hoy lista para empezar (full-screen).

Funcionalidad:

Full-screen por ejercicio, swipe o botón “Siguiente / Finalizar”.

Visualización de sets, reps, duración, peso y notas.

Opcional: resumen semanal rápido de métricas.

Componentes:

Header → Título de la sesión, fecha.

ExerciseScreen → Pantalla full-screen por ejercicio.

ExerciseMetrics → sets, reps, duración, peso.

ActionButton → Siguiente / Finalizar.

WeeklySummary → resumen de métricas (opcional).

4.2 Explorador de plantillas de entrenamiento

Propósito: Elegir o crear plantillas de entrenamiento.

Funcionalidad:

Ver plantillas propias y favoritas.

Crear, duplicar o editar plantillas.

Buscar por tags o dificultad.

Componentes:

TemplateCard → Nombre, dificultad, tags, botón favorito.

TemplateList → Grid o lista de plantillas.

TemplateFilters → Filtrado por tipo, tags, dificultad.

TemplateEditorModal → Crear/Editar plantilla.

4.3 Historial / Registro de entrenamientos

Propósito: Consultar sesiones pasadas y estadísticas de progreso.

Funcionalidad:

Lista de sesiones por fecha.

Detalle de sets, reps, duración y notas.

Visualización de PRs (Personal Records).

Filtrado por tipo de ejercicio o rango de fechas.

Componentes:

SessionCard → Fecha, título, completado.

SessionDetailModal → Detalles de sets y notas.

PRList → Personal Records destacados.

FilterBar → Selector de rango de fechas o tipo de ejercicio.

4.4 Perfil del usuario / Ajustes

Propósito: Configuración de cuenta y objetivos personales.

Funcionalidad:

Editar nombre, email, contraseña, foto de perfil.

Ver objetivos activos.

Preferencias de notificaciones.

Componentes:

ProfileHeader → Avatar, nombre, nivel opcional.

GoalsList → Lista de objetivos activos.

ProfileForm → Editar datos personales.

4.5 Página de estadísticas / progreso avanzado

Propósito: Analítica profunda del rendimiento y evolución de PRs.

Funcionalidad:

Gráficas de volumen semanal/mensual.

Comparación de PRs históricos.

Selección de rangos de tiempo.

Componentes:

StatsCard → Métrica específica (volumen, racha, PR).

Graph → Gráfica interactiva.

PeriodSelector → Cambiar rango temporal.

4.6 Página de ejercicios

Propósito: Gestionar y consultar todos los ejercicios disponibles.

Funcionalidad:

Listado de ejercicios con nombre, descripción, dificultad, grupo muscular y tipo.

Agregar, editar y eliminar ejercicios (CRUD completo).

Filtrado por grupo muscular, tipo o dificultad.

Componentes:

ExerciseCard → Nombre, tipo, dificultad, grupo muscular, acciones (editar/eliminar).

ExerciseList → Grid o lista scrollable.

ExerciseFilters → Filtrado y búsqueda.

ExerciseFormModal → Añadir o modificar ejercicio.

ConfirmationModal → Confirmar eliminación.

5️⃣ Rutas en React Router
/
├─ /dashboard        → Dashboard principal (sesión de hoy full-screen)
├─ /templates        → Explorador de plantillas
├─ /history          → Historial de entrenamientos
├─ /profile          → Perfil y ajustes
├─ /stats            → Estadísticas y progreso avanzado
├─ /exercises        → Gestión de ejercicios (CRUD)

Notas sobre el router:

Todas las páginas renderizan dentro de MainLayout.

Header y Footer son consistentes en todas las páginas.

Navegación mobile-first mediante NavLink en footer.

6️⃣ Componentes reutilizables

Header → Título, fecha, etc.

Footer → Navegación principal (mobile).

ActionButton → Botones con feedback rápido.

ExerciseMetrics → Sets, reps, duración, peso.

ExerciseCard / TemplateCard / SessionCard / StatsCard

Modal genérico → Forms y confirmaciones.

7️⃣ Flujo principal de la app (resumido)

Usuario abre la app → Dashboard (sesión de hoy).

Completa ejercicios full-screen → swipe/botón siguiente.

Puede consultar:

Plantillas disponibles → /templates

Historial de entrenamientos → /history

Ejercicios disponibles / CRUD → /exercises

Perfil y objetivos → /profile

Estadísticas avanzadas → /stats
