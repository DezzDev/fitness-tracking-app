# ADR-014: Tailwind CSS v4 with CSS-Only Configuration

**Status**: Accepted  
**Date**: 2025-01-01  
**Scope**: Frontend

## Context

The frontend needs a styling approach. Tailwind CSS v4 was recently released with a new configuration model that replaces `tailwind.config.ts` with CSS-native `@theme` directives.

## Decision

Use **Tailwind CSS v4** configured entirely via CSS (`@theme` blocks in `index.css`) and the `@tailwindcss/vite` plugin. No `tailwind.config.ts` file exists.

### Configuration Approach

Theme tokens are defined directly in `frontend/src/index.css`:

```css
@theme {
  --font-barlow: 'Barlow Condensed', sans-serif;
  --font-bebas: 'Bebas Neue', cursive;
  --color-background: var(--bg);
  --color-primary: var(--orange);
  /* ... all tokens */
}

@theme inline {
  --radius: 0.5rem;
  --color-sidebar: var(--sidebar);
  /* ... inline tokens */
}
```

Raw CSS custom properties are defined in `:root` and referenced by `@theme` tokens, bridging the design system with Tailwind's utility generation.

### Build Pipeline

- **Vite plugin**: `@tailwindcss/vite` (no PostCSS config needed for Tailwind)
- **Animation**: `tw-animate-css` imported in CSS for shadcn/ui transitions

## Consequences

### Positive

- **No config file**: All theme values live in CSS, colocated with the design tokens they define. One file to find all colors, fonts, radii.
- **CSS standard**: `@theme` directives produce standard CSS custom properties; no JavaScript-to-CSS compilation step.
- **Faster builds**: Tailwind CSS v4 with the Vite plugin is significantly faster than v3's PostCSS-based pipeline.
- **Variable composability**: CSS variables defined in `:root` are referenced in `@theme`, enabling the two-layer token system (raw palette → semantic tokens).

### Negative

- **Tailwind v4 is new**: Less community content, fewer examples, and some ecosystem tools (VS Code extensions, older shadcn/ui docs) still reference v3 syntax.
- **`@theme` learning curve**: Developers familiar with `tailwind.config.ts` need to learn the CSS-native configuration model.
- **No runtime access**: Theme values defined in CSS cannot be easily accessed in JavaScript without `getComputedStyle()`.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Tailwind CSS v3 with `tailwind.config.ts` | v4 is faster and eliminates the config file; project started fresh with v4 |
| CSS Modules | Scoped by default but verbose; no utility-first rapid development |
| Vanilla CSS / SCSS | No utility classes; slower development; harder to maintain consistency |
| CSS-in-JS (styled-components, Emotion) | Runtime overhead; conflicts with Tailwind's static utility approach |
| UnoCSS | Compatible alternative but smaller ecosystem; Tailwind is the community standard |

## References

- CSS config: `frontend/src/index.css`
- Vite plugin: `frontend/vite.config.ts`
- Design system tokens: `docs/architecture/08-design-system.md` (section 1)
