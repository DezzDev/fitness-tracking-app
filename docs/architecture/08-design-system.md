# Design System

Dark-only fitness tracking UI built on shadcn/ui (New York style), Tailwind CSS v4, and two custom fonts. The visual language is **dark & sophisticated**: deep near-black backgrounds, warm off-white text, and a bold orange accent system. Feedback is fast and punchy (game-like), avoiding long smooth animations.

---

## 1. Color Palette

### Core Surfaces

| Token               | CSS Variable          | Hex / Value                  | Usage                     |
|----------------------|-----------------------|------------------------------|---------------------------|
| `--bg`               | `--color-background`  | `#121212`                    | Page background (near-black) |
| `--surface`          | `--color-card`        | `#1A1A1A`                    | Cards, panels, muted bg   |
| `--surface-elevated` | `--color-popover`     | `#222222`                    | Popovers, elevated panels |
| `--gray-dark`        | `--color-secondary`   | `#2A2A2F`                    | Secondary background      |
| `--sidebar`          | `--color-sidebar`     | `#151515`                    | Sidebar background        |

### Orange Accent System

| Token              | Hex / Value                  | Usage                                    |
|--------------------|------------------------------|------------------------------------------|
| `--orange`         | `#FF6F3C`                    | Primary brand, buttons, focus rings, highlights |
| `--orange-warm`    | `#FFC18E`                    | Secondary accent, micro-details, interactions, gradient endpoint |
| `--orange-muted`   | `#cc5930`                    | Dark muted orange (not Tailwind-mapped)  |
| `--orange-glow`    | `rgba(255, 111, 60, 0.35)`  | Glow shadow effect                       |
| `--orange-subtle`  | `rgba(255, 111, 60, 0.08)`  | Active sidebar state, subtle tints       |
| `--border-warm`    | `rgba(255, 111, 60, 0.25)`  | Warm semi-transparent borders/shadows    |

### Neutral Tones

| Token          | Hex       | Tailwind Mapping            | Usage                    |
|----------------|-----------|-----------------------------|--------------------------|
| `--white`      | `#E0E0E0` | `--color-foreground`        | Primary text (light gray, legible) |
| `--gray-light` | `#A8A29E` | `--color-secondary-foreground` | Secondary text          |
| `--gray-mid`   | `#6B6560` | `--color-muted-foreground`  | Muted/placeholder text   |

### Semantic Colors

| Token            | Hex       | Usage               |
|------------------|-----------|----------------------|
| `--destructive`  | `#DC2626` | Errors, delete actions |
| `--success`      | `#16A34A` | Success states, beginner difficulty |
| `--warning`      | `#D97706` | Warnings, intermediate difficulty |
| `--border`       | `#2A2A2A` | Standard borders     |
| `--border-strong`| `#333333` | Emphasized borders (not Tailwind-mapped) |
| `--input`        | `#2A2A2A` | Input borders/bg     |
| `--ring`         | `#FF6F3C` | Focus ring           |

### Chart Palette

| Token       | Hex       | Color     |
|-------------|-----------|-----------|
| `--chart-1` | `#FF6F3C` | Orange    |
| `--chart-2` | `#FFC18E` | Warm orange |
| `--chart-3` | `#16A34A` | Green     |
| `--chart-4` | `#D97706` | Amber     |
| `--chart-5` | `#A855F7` | Purple    |

### Tailwind Token Mapping Summary

```
primary           -> --orange (#FF6F3C)
primary-foreground -> --bg (#121212)
accent            -> --orange-warm (#FFC18E)
accent-foreground -> --white (#E0E0E0)
destructive       -> --destructive (#DC2626)
muted             -> --surface (#1A1A1A)
muted-foreground  -> --gray-mid (#6B6560)
```

### Dark Mode

No dark mode toggle exists. The entire theme is dark-only. All `:root` variables define a dark palette. The `dark:` Tailwind prefix classes in shadcn/ui components are vestigial from the library defaults -- they do not switch themes.

---

## 2. Typography

### Fonts

Two Google Fonts loaded in `index.css`:

| Font               | CSS Variable    | Tailwind Class | Weights          | Role           |
|--------------------|-----------------|----------------|------------------|----------------|
| **Bebas Neue**     | `--font-bebas`  | `font-bebas`   | 400 (single)     | Display, headings, stat numbers, CTAs |
| **Barlow Condensed** | `--font-barlow` | `font-barlow` | 300-700          | Body, UI, labels, form fields |

`font-barlow` is set on `<body>` as the default.

### Type Scale

| Usage               | Font          | Size                             | Weight      | Tracking           | Other           |
|---------------------|---------------|----------------------------------|-------------|---------------------|-----------------|
| Hero heading        | `font-bebas`  | `clamp(56px, 12vw, 88px)`       | 400         | `tracking-wide`     | `leading-[0.9]` |
| Auth hero           | `font-bebas`  | `text-6xl` / `xl:text-7xl`      | 400         | `tracking-wide`     | --              |
| Page title          | `font-bebas`  | `text-4xl`                       | 400         | `tracking-wide`     | --              |
| Section heading     | `font-bebas`  | `text-lg`                        | 400         | `tracking-widest uppercase` | --     |
| Stat number         | `font-bebas`  | `text-[42px]` or `text-4xl`     | 400         | --                  | `leading-none`  |
| CTA button text     | `font-bebas`  | `text-[22px]`                    | 400         | `tracking-[4px]`    | --              |
| Card title          | (default)     | `text-lg`                        | `font-semibold` | --              | --              |
| Body / UI text      | `font-barlow` | `text-base` / `text-sm`          | 400         | --                  | --              |
| Form label          | `font-barlow` | `text-xs uppercase`              | `font-semibold` | `tracking-wide` | --             |
| Micro label         | `font-barlow` | `text-[11px]`                    | `font-semibold` or `font-medium` | `tracking-[3px]`-`tracking-[4px]` | `uppercase` |
| Stat sublabel       | `font-barlow` | `text-xs`                        | 400         | `tracking-[0.2em]`  | `uppercase`     |
| Action button label | `font-barlow` | `text-sm`                        | `font-semibold` | `tracking-wide uppercase` | --   |

### Text Gradient

```css
.text-gradient-orange {
  background: linear-gradient(135deg, var(--orange) 0%, var(--orange-warm) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

Used for highlight words in hero headings.

---

## 3. Spacing & Layout

### Page Structure

```
max-w-7xl mx-auto              # Container: 1280px max
px-4 sm:px-6 lg:px-8           # Responsive horizontal padding
py-8                            # Vertical page padding
```

### Key Dimensions

| Element          | Value                     |
|------------------|---------------------------|
| Header height    | `h-16` (4rem / 64px)     |
| Sidebar width    | `w-64` (16rem / 256px)   |
| Sidebar gap      | `gap-8` (2rem / 32px)    |
| Auth form width  | `max-w-md` (28rem / 448px) |
| Dialog width     | `sm:max-w-lg` (32rem / 512px) |

### Spacing Conventions

| Context            | Pattern       |
|--------------------|---------------|
| Between form sections | `space-y-6`  |
| Within form cards  | `space-y-4` or `p-6 space-y-4` |
| Form fields (label + input + error) | `space-y-2` |
| Card padding       | `px-6 py-6` (via Card py-6 + CardContent px-6) |
| Button groups      | `gap-3`       |
| Nav link padding   | `px-4 py-3`  |

### Radius Scale

```
--radius:    0.5rem (8px)          -- root value
--radius-sm: calc(--radius - 4px)  -- ~4px
--radius-md: calc(--radius - 2px)  -- ~6px
--radius-lg: var(--radius)         -- 8px
--radius-xl: calc(--radius + 4px)  -- ~12px
```

Cards use `rounded-xl`. Buttons and inputs use `rounded-md`. Badges use `rounded-full` (pill).

---

## 4. Responsive Breakpoints

| Breakpoint | Pixels | Primary Usage                                    |
|------------|--------|--------------------------------------------------|
| `sm:`      | 640px  | Padding, button layout (col → row), dialog alignment |
| `md:`      | 768px  | Input text size (`md:text-sm`)                   |
| `lg:`      | 1024px | Sidebar toggle, auth split-screen, page padding  |
| `xl:`      | 1280px | Auth hero text scaling                            |

### Responsive Patterns

- **Sidebar**: `hidden lg:block` on desktop, hamburger menu `lg:hidden` on mobile with `fixed inset-0 z-50 bg-black/60 backdrop-blur-sm` overlay
- **Auth layout**: `flex-col lg:flex-row` split-screen; left decorative panel `hidden lg:flex lg:w-1/2`
- **Action buttons**: `flex flex-col sm:flex-row` (stack on mobile, row on desktop)
- **Dialog footer**: `flex flex-col-reverse sm:flex-row sm:justify-end`

---

## 5. Component Library

### shadcn/ui Configuration

| Setting       | Value         |
|---------------|---------------|
| Style         | `new-york`    |
| Base color    | `neutral`     |
| CSS Variables | `true`        |
| Icon library  | `lucide`      |
| RSC           | `false`       |

### Installed Components (22)

```
alert        avatar       badge        button
calendar     card         command      dialog
dropdown-menu  form       input        label
popover      select       separator    skeleton
sonner       switch       table        tabs
textarea     tooltip
```

### Button Variants

| Variant       | Appearance                                       |
|---------------|--------------------------------------------------|
| `default`     | `bg-primary text-primary-foreground` (orange on black) |
| `destructive` | `bg-destructive text-white` (red)                |
| `outline`     | `border bg-background` + hover accent            |
| `secondary`   | `bg-secondary text-secondary-foreground` (gray)  |
| `ghost`       | Transparent + hover accent                        |
| `link`        | Orange text + underline on hover                  |

| Size      | Height  |
|-----------|---------|
| `default` | `h-9`   |
| `sm`      | `h-8`   |
| `lg`      | `h-10`  |
| `icon`    | `size-9` |
| `icon-sm` | `size-8` |
| `icon-lg` | `size-10` |

### Badge Variants

All badges are `rounded-full` (pill shape).

| Variant       | Appearance                                   |
|---------------|----------------------------------------------|
| `default`     | `bg-primary text-primary-foreground`         |
| `secondary`   | `bg-secondary text-secondary-foreground`     |
| `destructive` | `bg-destructive text-white`                  |
| `outline`     | Border only, foreground text                  |

### Card Structure

```
Card              -> rounded-xl border shadow-sm, bg-card
  CardHeader      -> @container grid layout, px-6
    CardTitle     -> font-semibold
    CardDescription -> text-muted-foreground text-sm
    CardAction    -> Grid-positioned action slot
  CardContent     -> px-6
  CardFooter      -> px-6, flex items-center
```

### Alert Variants

| Variant       | Appearance                           |
|---------------|--------------------------------------|
| `default`     | `bg-card text-card-foreground`       |
| `destructive` | `text-destructive bg-card`           |

---

## 6. Domain-Specific Patterns

### Difficulty Badges

| Difficulty     | Border + Text                             | Background              |
|----------------|-------------------------------------------|-------------------------|
| `beginner`     | `border-[var(--success)] text-[var(--success)]` | `bg-[var(--success)]/10` |
| `intermediate` | `border-[var(--warning)] text-[var(--warning)]` | `bg-[var(--warning)]/10` |
| `advanced`     | `border-destructive text-destructive`     | `bg-destructive/10`     |

### Exercise Type Badges

| Type         | Color Scheme                                      |
|--------------|---------------------------------------------------|
| `strength`   | `bg-primary/10 text-primary border-primary/20`    |
| `endurance`  | `bg-[var(--success)]/10 text-[var(--success)]`    |
| `skill`      | `bg-[#A855F7]/10 text-[#A855F7]`  (purple)       |
| `explosive`  | `bg-accent/10 text-accent border-accent/20`       |

### Muscle Group Badge

`variant="secondary"` with `bg-[var(--surface-elevated)] text-muted-foreground`.

---

## 7. Glow & Surface Effects

### Glow Utilities

```css
.glow-orange {
  box-shadow: 0 0 20px var(--orange-glow), 0 0 60px rgba(255,111,60,0.1);
}

.glow-orange-sm {
  box-shadow: 0 0 10px var(--orange-glow);
}

.border-glow {
  border-color: var(--orange);
  box-shadow: /* inner + outer glow */;
}
```

Usage: Submit buttons (`glow-orange-sm hover:glow-orange`), logo box (`glow-orange-sm`).

### Surface Noise

```css
.surface-noise::after {
  /* SVG feTurbulence noise overlay at 2.5% opacity */
}
```

Used on the auth layout decorative panel for texture.

---

## 8. Icons

**Library**: Lucide React

### Size Conventions

| Context             | Pattern                        |
|---------------------|--------------------------------|
| Inline with text    | `className="h-4 w-4"`         |
| In buttons (auto)   | Inherited `size-4` from Button base classes |
| Standalone / toggle | `size={20}` prop               |
| Navigation          | `size={20}`                    |
| Loading spinner     | `Loader2` + `animate-spin`, `h-4 w-4` or `h-5 w-5` |

### Menu Item Pattern

```tsx
<Icon className="mr-2 h-4 w-4" /> Label text
```

### Commonly Used Icons

| Category    | Icons                                           |
|-------------|------------------------------------------------|
| Navigation  | `Home`, `Dumbbell`, `TrendingUp`, `User`, `Menu`, `LucideSidebarClose` |
| Actions     | `Eye`, `EyeOff`, `Pencil`, `Trash2`, `LogOut`, `MoreVertical` |
| UI chrome   | `Loader2`, `XIcon`, `SearchIcon`, `ChevronDown/Up/Left/Right`, `CheckIcon` |
| Feedback    | `AlertTriangle`, `CircleCheckIcon`, `InfoIcon`, `TriangleAlertIcon`, `OctagonXIcon` |
| Domain      | `Calendar`, `Dumbbell`                         |

---

## 9. Forms

### Technology Stack

React Hook Form + Zod resolver + shadcn/ui components. Two patterns coexist:

**Pattern A -- Direct `register()` (most common)**:
```tsx
const { register, handleSubmit, formState: { errors } } = useForm<T>({
  resolver: zodResolver(schema),
});

<div className="space-y-2">
  <Label className="text-xs uppercase tracking-wide font-barlow font-semibold text-muted-foreground">
    Field Name <span className="text-destructive">*</span>
  </Label>
  <Input {...register('fieldName')} />
  {errors.fieldName && (
    <p className="text-sm text-destructive font-barlow">{errors.fieldName.message}</p>
  )}
</div>
```

**Pattern B -- `<Form>`/`<FormField>` wrapper** (available via shadcn `form.tsx`, not commonly used in existing features).

### Form Layout

```
<form className="space-y-6">           // between sections
  <Card className="p-6 space-y-4">     // within section
    <div className="space-y-2">        // per field
      <Label />
      <Input />
      <p className="text-sm text-destructive" />  // error
    </div>
  </Card>
</form>
```

### Password Toggle

```tsx
<div className="relative">
  <Input type={showPassword ? 'text' : 'password'} />
  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>
</div>
```

### Submit Button Pattern

```tsx
<Button type="submit" size="lg" disabled={!isDirty || isPending}
  className="w-full glow-orange-sm hover:glow-orange transition-shadow uppercase font-barlow font-semibold tracking-wide">
  {isPending ? (
    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Guardando...</>
  ) : 'Guardar'}
</Button>
```

### Unsaved Changes Guard

`useUnsavedChanges(isDirty && !hasSubmitted && !isSubmitting)` -- renders a destructive Alert with cancel/discard options. Uses `react-router-dom` `useBlocker` + `beforeunload` event.

---

## 10. Toasts

**Library**: Sonner

**Setup**: `<Toaster />` from `"sonner"` mounted in `RootLayout.tsx`.

A themed wrapper exists at `components/ui/sonner.tsx` with custom Lucide icons per type:

| Type      | Icon               |
|-----------|--------------------|
| `success` | `CircleCheckIcon`  |
| `info`    | `InfoIcon`         |
| `warning` | `TriangleAlertIcon`|
| `error`   | `OctagonXIcon`     |
| `loading` | `Loader2` + `animate-spin` |

Style overrides match the theme:
```
--normal-bg:     var(--popover)
--normal-text:   var(--popover-foreground)
--normal-border: var(--border)
--border-radius: var(--radius)
```

**Usage pattern**: called in React Query mutation hooks:
```tsx
onSuccess: () => toast.success('Perfil actualizado correctamente'),
onError: (error) => toast.error(handleApiError(error, 'Error al actualizar')),
```

Only `toast.success()` and `toast.error()` are used across the codebase.

---

## 11. Animation

**Library**: `tw-animate-css` (imported in `index.css`)

Provides classes used by shadcn/ui components:
- `animate-in` / `animate-out`
- `fade-in-0` / `fade-out-0`
- `zoom-in-95` / `zoom-out-95`
- `slide-in-from-top-2` / `slide-in-from-bottom-2`
- `slide-in-from-left-1/2` / `slide-in-from-right-1/2`

### Custom Animations

**EntryScreen fade-in**: CSS transition `opacity` + `translateY(20px)` with 500ms duration, triggered after 50ms timeout.

**Loading spinner**: `Loader2` icon with `animate-spin` class.

### Transition Conventions

- Buttons: `transition-all` (in CVA base) or `transition-shadow` for glow effects
- Cards: `hover:shadow-lg transition-shadow`
- Nav links: `transition-colors`
- Active press: `active:scale-[0.98]`

---

## 12. Navigation Patterns

### Active Link

```tsx
// Active
className="bg-[var(--orange-subtle)] text-primary font-semibold border-l-2 border-primary"

// Inactive
className="text-muted-foreground hover:bg-[var(--surface-elevated)] hover:text-foreground"
```

### Navigation Items

| Label           | Route        | Icon         |
|-----------------|-------------|--------------|
| Dashboard       | `/dashboard` | `Home`       |
| Entrenamientos  | `/workouts`  | `Dumbbell`   |
| Ejercicios      | `/exercises` | `TrendingUp` |
| Perfil          | `/profile`   | `User`       |

### Logo

```
w-8 h-8 bg-primary rounded-lg glow-orange-sm
  "FT" in font-bebas text-base text-background font-bold
"Fitness Tracker" in font-bebas text-xl tracking-wide text-foreground
```

---

## 13. UI Language

All user-facing text is in **Spanish**. This includes navigation labels, form labels, buttons, toast messages, placeholder text, error messages, and dates (formatted with `date-fns` `es` locale).

---

## 14. Delete Confirmation Pattern

```tsx
<Dialog>
  <DialogContent>
    <DialogTitle className="text-destructive flex items-center gap-2">
      <AlertTriangle className="h-5 w-5" /> Confirm title
    </DialogTitle>
    <DialogDescription>Explanation text</DialogDescription>
    <DialogFooter>
      <Button variant="outline" onClick={close}>Cancelar</Button>
      <Button variant="destructive" onClick={action}>Eliminar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 15. Action Menu Pattern

Three-dot menu on cards for CRUD actions:

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="sm">
      <MoreVertical className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> Ver</DropdownMenuItem>
    <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
    <DropdownMenuItem className="text-destructive focus:text-destructive">
      <Trash2 className="mr-2 h-4 w-4" /> Eliminar
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 16. Divider Pattern

Horizontal rule with centered text overlay:

```tsx
<div className="relative my-6">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-border" />
  </div>
  <div className="relative flex justify-center text-sm">
    <span className="px-4 bg-[var(--surface)] text-muted-foreground">Text</span>
  </div>
</div>
```
