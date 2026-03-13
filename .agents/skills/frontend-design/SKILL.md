---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality.
Use this skill when the user asks to build web components, pages, artifacts, posters, or
applications (examples include websites, landing pages, dashboards, React components,
HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished
code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid
generic "AI slop" aesthetics. Implement real working code with exceptional attention to
aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to
build. They may include context about the purpose, audience, or technical constraints.

---

## Product Identity

This is a **fitness tracker application** built for athletes who train seriously.
The aesthetic is:

- Dark, sophisticated, minimal
- Focused on real performance data
- No gamification, no XP, no decorative achievements
- Progress is communicated through objective data only

Every interface decision must reinforce this identity.

---

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: This product uses a single fixed tone — **dark industrial precision**.
  Think: raw performance data rendered with surgical elegance. No softness.
  No decoration for decoration's sake. Every element earns its place.
- **Constraints**: React + Vite + TypeScript. **Tailwind CSS 4** as the primary
  styling system. Lucide React icons. shadcn/ui components when needed.
  No external animation libraries unless explicitly required — prefer CSS transitions
  via Tailwind's `transition-*` utilities or arbitrary values.
- **Differentiation**: The interface must feel like a **professional instrument**,
  not a consumer app. What someone will remember: the weight of the typography,
  the restraint of the color, and the immediacy of the interactions.

**CRITICAL**: Choose a clear conceptual direction and execute it with precision.
In this product, that direction is already established — execute it with total fidelity.

Then implement working code that is:

- Production-grade and functional
- Visually striking and memorable
- Cohesive with the established aesthetic
- Meticulously refined in every detail

---

## Styling System

**All styling is done with Tailwind CSS 4.** This is non-negotiable.

Rules:
- Use Tailwind utility classes as the primary styling method.
- Never write raw inline `style={{}}` props unless a value cannot be expressed
  with Tailwind (e.g. a truly dynamic runtime value like a percentage width
  derived from state — e.g. `style={{ width: \`${progress}%\` }}`).
- Never write separate `.css` files or `<style>` blocks for component styling.
- CSS custom properties (see Color section below) are defined once in a global
  `index.css` or `globals.css` under `@layer base` and then consumed via
  Tailwind's arbitrary value syntax: `bg-[var(--orange)]`, `text-[var(--white)]`,
  `border-[var(--border)]`.
- For font imports (`Bebas Neue`, `Barlow Condensed`), use `@import` in the
  global CSS file, then register them in `tailwind.config` under
  `theme.extend.fontFamily`.
- Tailwind's `@apply` is acceptable inside global CSS for repeated base patterns
  (e.g. shared button resets), but component-level styling must use utility classes.
- Responsive design uses Tailwind breakpoint prefixes (`sm:`, `md:`, `lg:`).
- Arbitrary values are used freely when Tailwind's scale doesn't cover the
  exact value needed: `text-[11px]`, `tracking-[4px]`, `leading-[0.9]`,
  `w-[56px]`, `max-w-[480px]`.

---

## Frontend Aesthetics Guidelines

### Typography

Two fonts. No exceptions.

- **Display / Headlines**: `Bebas Neue` — dominant, condensed, uppercase.
  Used for exercise names, session titles, metric values, and any element
  that needs to command attention.
- **Data / Body**: `Barlow Condensed` (weights 400, 500, 600, 700) — technical,
  precise, maximum legibility. Used for labels, tags, secondary text,
  navigation items, and button text (non-display).

Tailwind setup in `tailwind.config.ts`:
```ts
theme: {
  extend: {
    fontFamily: {
      display: ['"Bebas Neue"', 'cursive'],
      data: ['"Barlow Condensed"', 'sans-serif'],
    },
  },
}
```

Tailwind usage:
- Headlines: `font-display text-[clamp(52px,13vw,80px)] tracking-[2px] leading-[0.9]`
- Labels / metadata: `font-data text-[11px] tracking-[4px] font-semibold uppercase`
- Data values: `font-display` sized by hierarchy
- Never use `font-sans`, `font-mono`, or any default Tailwind font family

### Color & Theme

One palette. Defined as CSS custom properties in `globals.css`, consumed via
Tailwind arbitrary values.
```css
/* globals.css — @layer base */
:root {
  --bg: #0a0a0a;
  --surface: #0f0f0f;
  --border: #1e1e1e;
  --orange: #E85D04;
  --orange-warm: #F4845F;
  --orange-glow: rgba(232, 93, 4, 0.4);
  --white: #F5F0EB;
  --gray-light: #C8C0B8;
  --gray-mid: #6B6560;
  --gray-dark: #3A3530;
}
```

Tailwind usage examples:
```jsx
// Backgrounds
<div className="bg-[var(--bg)]" />
<div className="bg-[var(--surface)]" />

// Text
<p className="text-[var(--white)]" />
<p className="text-[var(--gray-mid)]" />

// Borders
<div className="border border-[var(--border)]" />
<div className="border-b border-[var(--border)]" />

// Accent
<button className="bg-[var(--orange)] text-black" />
<div className="shadow-[0_0_8px_var(--orange-glow)]" />
```

Rules:
- Orange (`--orange`) is used **only for**: primary CTA buttons, active indicators,
  progress bars, set completion dots, active nav markers, and key metric highlights.
  Never as decoration.
- Text hierarchy: `--white` → `--gray-light` → `--gray-mid` → `--gray-dark`
- Borders always use `--border`
- Backgrounds alternate between `--bg` and `--surface` only
- Pure `bg-black` is reserved for the session completion screen

### Motion

Fast, contundent, purposeful. Never ornamental.

Tailwind transition utilities:
```jsx
// Standard transition
className="transition-all duration-200 ease-out"
className="transition-colors duration-300 ease-out"

// Button press
className="active:scale-[0.97] transition-transform duration-100"

// Progress bar fill (dynamic width — use inline style + Tailwind transition class)
<div
  className="transition-[width] duration-400 ease-out"
  style={{ width: `${progress}%` }}
/>
```

Rules:
- Standard transitions: `duration-200` to `duration-300`
- Entry animations: combine Tailwind `opacity-0`/`opacity-100` + `translate-y-5`/
  `translate-y-0` toggled via state, with `transition-all duration-500`
- Sequential reveals: use `setTimeout` steps (100ms, 400ms, 700ms, 1000ms)
  toggling Tailwind classes via state
- No bounce, no spring, no elastic, no decorative sequences
- Session completion animation sequence must finish in under 1 second

### Spatial Composition
```jsx
// App container
className="flex h-screen max-w-[480px] mx-auto border-x border-[var(--border)]"

// Sidebar
className="flex flex-col items-center justify-between py-5 border-r border-[var(--border)] min-w-[56px] bg-[var(--surface)]"

// Content area
className="flex-1 overflow-hidden relative bg-[var(--bg)]"

// Standard padding
className="px-8 py-5"   // 32px horizontal, 20px vertical
className="px-8 py-10"  // 32px horizontal, 40px vertical

// Section divider
className="border-t border-[var(--border)]"
className="border-b border-[var(--border)]"

// Metric grid
className="grid grid-cols-2 gap-6"
```

Rules:
- No `rounded-*` on structural containers — sharp edges everywhere
- No `shadow-*` except `shadow-[0_0_8px_var(--orange-glow)]` on active orange elements
- Generous vertical spacing between hierarchy levels using `mb-*` / `gap-*`

### Backgrounds & Visual Details

- **Noise texture**: Fixed SVG overlay, always present.
  Rendered as a component, positioned with `fixed inset-0 w-full h-full`,
  `opacity-[0.035]`, `pointer-events-none`, `z-[1]`.
- Main background: flat `bg-[var(--bg)]`. No gradient utilities on backgrounds.
- Completion screen: `bg-black` for maximum contrast impact.
- No decorative illustrations. Lucide React icons only, used functionally.

### Component Patterns

**Primary CTA Button** (e.g., "INICIAR SESIÓN", "+ COMPLETAR SET"):
```jsx
className="w-full bg-[var(--orange)] text-black font-display text-[22px] 
           tracking-[4px] py-5 cursor-pointer active:scale-[0.98] 
           transition-transform duration-100"
```

**Secondary / Ghost Button** (e.g., "VER DETALLE"):
```jsx
className="w-full bg-transparent border border-[var(--border)] 
           text-[var(--gray-light)] font-data text-[14px] 
           tracking-[3px] uppercase py-[18px] cursor-pointer"
```

**Disabled / Completed Button**:
```jsx
className="w-full bg-transparent border border-[var(--border)] 
           text-[var(--gray-mid)] font-data text-[14px] 
           tracking-[3px] uppercase py-[18px] cursor-default"
```

**Set Indicator — Completed**:
```jsx
className="w-[10px] h-[10px] rounded-full bg-[var(--orange)] 
           shadow-[0_0_8px_var(--orange-glow)] transition-all duration-200"
```

**Set Indicator — Pending**:
```jsx
className="w-[10px] h-[10px] rounded-full border-[1.5px] 
           border-[var(--border)] bg-transparent transition-all duration-200"
```

**Navigation Sidebar Item — Active**:
```jsx
className="relative w-full bg-[var(--border)] text-[var(--white)] 
           font-data text-[10px] tracking-[2px] font-bold py-[10px] 
           px-2 cursor-pointer"
// Active left-border strip:
<span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 
                 bg-[var(--orange)]" />
```

**Navigation Sidebar Item — Inactive**:
```jsx
className="w-full bg-transparent text-[var(--gray-dark)] font-data 
           text-[10px] tracking-[2px] font-bold py-[10px] px-2 cursor-pointer"
```

**Session Active Dot** (sidebar bottom):
```jsx
className="w-2 h-2 rounded-full bg-[var(--orange)] 
           shadow-[0_0_10px_var(--orange-glow)]"
```

**Progress Dots** (exercise navigation):
```jsx
// Active
className="h-1 w-5 rounded-sm bg-[var(--orange)] transition-all duration-200"
// Completed
className="h-1 w-1.5 rounded-sm bg-[var(--gray-mid)] transition-all duration-200"
// Pending
className="h-1 w-1.5 rounded-sm bg-[var(--border)] transition-all duration-200"
```

**Metric Tag** (muscle group label):
```jsx
className="font-data text-[10px] tracking-[4px] text-[var(--orange)] 
           font-semibold uppercase"
```

**Progress Bar**:
```jsx
// Track
className="h-[2px] bg-[var(--border)] rounded-sm overflow-hidden"
// Fill (dynamic width via inline style)
className="h-full bg-[var(--orange)] rounded-sm transition-[width] 
           duration-[400ms] ease-out shadow-[0_0_6px_var(--orange-glow)]"
style={{ width: `${progress}%` }}
```

---

## Layout Architecture

The app has 5 sections: `/dashboard`, `/workouts`, `/exercises`, `/stats`, `/profile`.

Every screen shares:
- The sidebar navigation (left, fixed)
- The noise texture overlay
- The CSS custom property palette
- The two-font system (`font-display` / `font-data`)
- All Tailwind arbitrary values referencing `var(--*)` tokens

The dashboard is the primary screen. It is a **full-screen, no-scroll** interface.
All content must fit without vertical scrolling. Structure:

1. Minimal header (date + session name + exercise counter)
2. Exercise name (dominant, optically centered)
3. Metrics (weight primary, reps secondary)
4. Set list (SET 1–N with indicators)
5. Primary CTA button
6. Progress bar + exercise count
7. Prev / Next navigation

---

## What to Never Do

- Never use Inter, Roboto, Arial, `font-sans`, or any default Tailwind font
- Never write raw inline styles for values expressible with Tailwind utilities
- Never use `rounded-*` on structural containers
- Never use purple, blue, or green accent colors
- Never apply gradient utilities to backgrounds
- Never add decorative illustrations or non-functional icons
- Never use bouncy or elastic animation utilities
- Never add gamification, XP, badges, or social sharing elements
- Never exceed the established CSS variable palette
- Never use more than two font families
- Never center-align body or label text — left-align data, right-align counters
- Never use `shadow-*` except `shadow-[0_0_Xpx_var(--orange-glow)]` on active
  orange elements
- Never use separate `.css` files for component-level styling