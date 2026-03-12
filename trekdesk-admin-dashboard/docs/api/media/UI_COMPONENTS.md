# UI Component Reference

All UI components live in `src/components/ui/`. They use **CSS Modules** for scoped styling (no Tailwind class strings). All components are built with `forwardRef` so refs work properly in form libraries and focus management.

---

## Button

**File:** `Button.tsx` / `Button.module.css`

A versatile button with multiple visual variants and sizes. Includes a built-in loading spinner.

### Props

| Prop        | Type                                                           | Default     | Description                               |
| ----------- | -------------------------------------------------------------- | ----------- | ----------------------------------------- |
| `variant`   | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | Visual style                              |
| `size`      | `'sm' \| 'md' \| 'lg' \| 'icon'`                               | `'md'`      | Size modifier                             |
| `isLoading` | `boolean`                                                      | `undefined` | Shows a spinning SVG; disables the button |
| `icon`      | `React.ReactNode`                                              | `undefined` | Renders an icon to the left of children   |
| `...rest`   | `ButtonHTMLAttributes<HTMLButtonElement>`                      | —           | Forwarded to `<button>`                   |

### Usage

```tsx
import { Button } from '../components/ui/Button';

// Primary action
<Button onClick={handleSave}>Save Settings</Button>

// Destructive action
<Button variant="danger" onClick={handleDelete}>Delete Trek</Button>

// Loading state
<Button isLoading={isSaving}>Save</Button>

// With icon
<Button icon={<PlusCircle size={16} />} variant="outline">Add Tour</Button>

// Icon-only button (use size="icon")
<Button size="icon" variant="ghost" aria-label="Close"><X size={16} /></Button>
```

### Variant Reference

| Variant     | Use Case                                            |
| ----------- | --------------------------------------------------- |
| `primary`   | Main CTA — filled with brand color                  |
| `secondary` | Secondary actions — muted fill                      |
| `outline`   | Border-only — for tertiary actions                  |
| `ghost`     | No border/fill — for icon buttons or subtle actions |
| `danger`    | Destructive actions — red fill                      |

---

## Input

**File:** `Input.tsx` / `Input.module.css`

A form input with built-in label, error state, and helper text rendering.

### Props

| Prop         | Type                                    | Default     | Description                                                           |
| ------------ | --------------------------------------- | ----------- | --------------------------------------------------------------------- |
| `label`      | `string`                                | `undefined` | Renders a `<label>` above the input                                   |
| `error`      | `string`                                | `undefined` | Renders a red error message below; applies error styling to the input |
| `helperText` | `string`                                | `undefined` | Renders a muted hint below (only shown when no error)                 |
| `...rest`    | `InputHTMLAttributes<HTMLInputElement>` | —           | Forwarded to `<input>`                                                |

### Usage

```tsx
import { Input } from '../components/ui/Input';

// Basic
<Input
  label="Trek Name"
  placeholder="e.g. Knuckles Forest Trail"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

// With error (from Zod)
<Input
  label="Content"
  error={errors.content?.[0]}   // e.g. "Content must be at least 10 characters"
  value={content}
  onChange={(e) => setContent(e.target.value)}
/>

// With helper text
<Input
  label="Temperature"
  type="number"
  helperText="Range: 0.0 (precise) – 2.0 (creative)"
/>
```

---

## Card

**File:** `Card.tsx` / `Card.module.css`

A container with a dark rounded surface. Exports 6 sub-components for semantic layout.

### Exports

| Component         | Element | Description                                       |
| ----------------- | ------- | ------------------------------------------------- |
| `Card`            | `<div>` | The root container                                |
| `CardHeader`      | `<div>` | Header area (typically holds title + description) |
| `CardTitle`       | `<h3>`  | Card heading                                      |
| `CardDescription` | `<p>`   | Subtitle / subheading                             |
| `CardContent`     | `<div>` | Main body content                                 |
| `CardFooter`      | `<div>` | Footer row (typically holds action buttons)       |

### Card Props

| Prop        | Type                             | Default     | Description                                       |
| ----------- | -------------------------------- | ----------- | ------------------------------------------------- |
| `variant`   | `'default' \| 'glass'`           | `'default'` | `'glass'` applies a backdrop blur + lower opacity |
| `hoverable` | `boolean`                        | `false`     | Adds a lift/glow effect on mouse hover            |
| `...rest`   | `HTMLAttributes<HTMLDivElement>` | —           | Forwarded to `<div>`                              |

### Usage

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';

<Card>
  <CardHeader>
    <CardTitle>AI Persona Settings</CardTitle>
    <CardDescription>Configure the voice and behavior of your AI assistant</CardDescription>
  </CardHeader>
  <CardContent>
    {/* form fields */}
  </CardContent>
  <CardFooter>
    <Button>Save</Button>
  </CardFooter>
</Card>

// Glassmorphism style
<Card variant="glass" hoverable>
  <CardContent>...</CardContent>
</Card>
```

---

## Badge

**File:** `Badge.tsx` / `Badge.module.css`

A small inline label used to indicate status or categories.

### Props

| Prop      | Type                                                                               | Default     | Description          |
| --------- | ---------------------------------------------------------------------------------- | ----------- | -------------------- |
| `variant` | `'default' \| 'secondary' \| 'destructive' \| 'outline' \| 'success' \| 'warning'` | `'default'` | Color style          |
| `...rest` | `HTMLAttributes<HTMLDivElement>`                                                   | —           | Forwarded to `<div>` |

### Variant Reference

| Variant       | Color       | Use Case                  |
| ------------- | ----------- | ------------------------- |
| `default`     | Brand color | Generic / primary tag     |
| `secondary`   | Muted       | Secondary info            |
| `destructive` | Red         | Error / danger status     |
| `outline`     | Bordered    | Neutral label             |
| `success`     | Green       | Completed / active status |
| `warning`     | Yellow      | Warning / pending status  |

### Usage

```tsx
import { Badge } from '../components/ui/Badge';

<Badge variant="success">Active</Badge>
<Badge variant="destructive">Expired</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="outline">{difficulty_level}</Badge>
```
