# ADR-012: Dark-Only Theme with Orange Accent System

**Status**: Accepted  
**Date**: 2025-01-01  
**Scope**: Frontend, Design

## Context

The application needs a visual identity. Key questions: Should it support light and dark modes? What should the brand color palette be?

## Decision

Implement a **dark-only theme** with an **orange accent system** on near-black surfaces with warm off-white text.

### Color System

**Surfaces** (darkest to lightest):
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#08080a` | Page background |
| `--sidebar` | `#0c0c0f` | Sidebar |
| `--surface` | `#111114` | Cards, panels |
| `--surface-elevated` | `#18181c` | Popovers, elevated panels |
| `--gray-dark` | `#2A2A2F` | Secondary backgrounds |

**Orange accent** (5 tokens):
| Token | Value | Usage |
|-------|-------|-------|
| `--orange` | `#E85D04` | Primary brand, buttons, focus rings |
| `--orange-warm` | `#F4845F` | Accent, gradient endpoint |
| `--orange-muted` | `#9e4a1c` | Dark muted variant |
| `--orange-glow` | `rgba(232,93,4,0.35)` | Glow shadow effects |
| `--orange-subtle` | `rgba(232,93,4,0.08)` | Active states, subtle tints |

**Text**: Warm off-white `#F0EBE3` (primary), `#A8A29E` (secondary), `#6B6560` (muted).

**Semantic**: `#DC2626` (destructive), `#16A34A` (success), `#D97706` (warning).

### Typography

Two fonts reinforce the athletic/editorial aesthetic:
- **Bebas Neue** -- Display font for headings, stat numbers, CTAs
- **Barlow Condensed** -- Body/UI font with weights 300-700

### Custom Effects

- `.glow-orange` / `.glow-orange-sm` -- Box-shadow glow on primary CTAs and logo
- `.text-gradient-orange` -- Orange-to-warm gradient on hero text
- `.surface-noise` -- SVG turbulence noise texture on decorative panels

## Rationale

- **Fitness aesthetic**: Dark themes with warm accents are common in fitness/gym apps. The orange conveys energy and intensity.
- **No mode switching complexity**: A single theme eliminates the need for `prefers-color-scheme` media queries, dark mode toggles, or dual token sets.
- **Reduced eye strain**: Dark backgrounds reduce screen glare during workouts.
- **Visual hierarchy**: The limited palette (orange on dark) creates strong contrast for CTAs and interactive elements.

## Consequences

### Positive

- **Simpler CSS**: One set of CSS variables; `dark:` prefixes in shadcn/ui components are no-ops
- **Strong brand identity**: The orange accent on near-black is distinctive and consistent
- **Accessible contrast**: Orange `#E85D04` on `#08080a` meets WCAG AA for large text

### Negative

- **No light mode**: Users who prefer light interfaces have no option
- **Accessibility concerns**: Some orange-on-dark combinations may not meet WCAG AA for normal-sized text (4.5:1 contrast ratio); muted text `#6B6560` on `#111114` is low contrast
- **Vestigial `dark:` classes**: shadcn/ui components include `dark:` prefixed classes that do nothing; they add dead code to the component files

## References

- Full color palette: `docs/architecture/08-design-system.md` (section 1)
- Typography scale: `docs/architecture/08-design-system.md` (section 2)
- Glow/surface effects: `docs/architecture/08-design-system.md` (section 7)
- CSS variables: `frontend/src/index.css`
