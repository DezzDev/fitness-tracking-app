# ADR-011: shadcn/ui as Component Library

**Status**: Accepted  
**Date**: 2025-01-01  
**Scope**: Frontend

## Context

The frontend needs a UI component library for common elements: buttons, cards, inputs, dialogs, selects, tables, dropdowns, tooltips, and more. The options range from fully packaged libraries (Material UI, Ant Design, Chakra UI) to copy-paste component collections (shadcn/ui).

## Decision

Use **shadcn/ui** (New York style) as the component library. Components are copied into `frontend/src/components/ui/` as source files, not installed as npm dependencies.

### Configuration

| Setting | Value |
|---------|-------|
| Style | `new-york` |
| Base color | `neutral` |
| CSS Variables | `true` |
| Icon library | `lucide` |
| RSC | `false` |

### Installed Components (22)

```
alert, avatar, badge, button, calendar, card, command, dialog,
dropdown-menu, form, input, label, popover, select, separator,
skeleton, sonner, switch, table, tabs, textarea, tooltip
```

### Supporting Libraries

- **Radix UI** -- Headless primitives that shadcn/ui builds on
- **class-variance-authority (CVA)** -- Component variant definitions
- **clsx + tailwind-merge** -- Class name composition via `cn()` utility
- **Lucide React** -- Icon library
- **Sonner** -- Toast notifications
- **cmdk** -- Command palette
- **React Day Picker** -- Calendar/date picker

## Consequences

### Positive

- **Full ownership**: Components live in the repository as editable source files. Customizations (variant additions, style overrides) are direct code changes, not theme overrides.
- **No dependency lock-in**: Updating shadcn/ui is optional; components are decoupled from upstream releases.
- **Tailwind-native**: Components use Tailwind CSS classes and CSS variables, aligning with the project's styling approach.
- **Accessible**: Built on Radix UI primitives with proper ARIA attributes, keyboard navigation, and focus management.
- **Lightweight**: Only the 22 needed components are included; no unused component code in the bundle.

### Negative

- **Manual updates**: When shadcn/ui releases improvements or fixes, they must be manually pulled or re-generated. There is no `npm update`.
- **22 files to maintain**: Each component file is project code that must be kept consistent during refactors.
- **Radix dependency tree**: Radix UI adds multiple `@radix-ui/*` packages to `node_modules`, though tree-shaking keeps the bundle impact low.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Material UI (MUI) | Heavy bundle, opinionated Material Design aesthetic, complex theming |
| Chakra UI | Good DX but runtime style injection; less aligned with Tailwind CSS |
| Ant Design | Enterprise aesthetic; very heavy; non-Tailwind |
| Headless UI (Tailwind Labs) | Fewer components than Radix; shadcn/ui provides pre-styled compositions on top of Radix |
| Custom components from scratch | Reinventing accessible primitives (dialogs, selects, dropdowns) is time-consuming and error-prone |

## References

- Component inventory: `docs/architecture/08-design-system.md` (section 5)
- shadcn config: `frontend/components.json`
- Component files: `frontend/src/components/ui/`
