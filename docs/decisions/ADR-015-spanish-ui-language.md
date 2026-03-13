# ADR-015: Spanish as UI Language

**Status**: Accepted  
**Date**: 2025-01-01  
**Scope**: Frontend

## Context

The application needs a language for all user-facing text: navigation labels, form labels, buttons, error messages, toast notifications, placeholder text, and date formatting.

## Decision

Use **Spanish** as the sole UI language. All user-facing text is hardcoded in Spanish throughout the frontend codebase. No internationalization (i18n) framework is used.

### Examples

- Navigation: "Dashboard", "Entrenamientos", "Ejercicios", "Perfil"
- Buttons: "Guardar", "Cancelar", "Eliminar", "Iniciar sesion"
- Toasts: "Perfil actualizado correctamente", "Error al actualizar"
- Form labels: "Nombre", "Correo electronico", "Contrasena"
- Dates: Formatted with `date-fns` `es` locale (`dd 'de' MMMM 'de' yyyy`)

## Rationale

- **Target audience**: The application is built for a Spanish-speaking user base.
- **Simplicity**: Hardcoded strings avoid the overhead of i18n key lookups, translation files, and context providers.
- **Development speed**: Direct strings in JSX are faster to write and easier to read during development than translation keys.

## Consequences

### Positive

- **No i18n overhead**: No translation files, no `t()` function calls, no `IntlProvider`, no language switching logic
- **Readable JSX**: Button labels, error messages, and placeholders are immediately visible in the component code

### Negative

- **No multi-language support**: Adding English or another language requires retrofitting an i18n framework (`react-i18next`, `next-intl`, etc.) and extracting every hardcoded string into translation files
- **Mixed languages**: Some technical terms appear in English (e.g., "Dashboard"), creating a mixed-language experience
- **Limited audience**: Non-Spanish speakers cannot use the application

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| `react-i18next` from the start | Adds complexity and indirection for a single-language app; can be added later if needed |
| English as default with i18n | Target audience is Spanish-speaking; starting in English then translating adds extra work |
| Both languages from the start | Doubles the string maintenance burden with no current requirement for multi-language |
