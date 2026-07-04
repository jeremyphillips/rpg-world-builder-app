# @rpg/ui

The shared component library for the public app and the dashboard. It is a
[shadcn/ui](https://ui.shadcn.com) (new-york style) setup built on
[Tailwind CSS v4](https://tailwindcss.com): copy-in primitives composed with a
single `cn` helper, a shared design-token theme, and a [Storybook](https://storybook.js.org)
workbench with the a11y addon.

The package ships **source** (no bundling step for consumers): `main`/`types`
point at `src`, so apps tree-shake what they import and their own bundler
compiles the TSX. The `build` script only emits type declarations for tooling.

## What's inside

| Export                                          | Kind       | Notes                                                                                                                                                        |
| ----------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cn`                                            | util       | `clsx` + `tailwind-merge` class composer                                                                                                                     |
| `rankItems`, `scoreItem`, `WeightedSearchField` | util       | Shared ranked substring search for comboboxes, link picker, and `ButtonDropdown`                                                                             |
| `Button`, `buttonVariants`, `ButtonProps`       | component  | 6 variants (`default` … `link`), 4 sizes                                                                                                                     |
| `Badge`, `DismissibleBadge`                     | component  | Static label chip; dismissible variant with remove control for tags/filters                                                                                  |
| `Input`                                         | component  | Styled text input                                                                                                                                            |
| `NumberInput`                                   | component  | Numeric input with hover/focus stepper controls; hides native browser spinners                                                                               |
| `Card` + subcomponents                          | component  | `CardHeader/Title/Description/Content/Footer`                                                                                                                |
| `Field` (compound)                              | component  | `Field.Root/Label/Control/Hint/Error`; centralizes id + aria wiring                                                                                          |
| `FormField`                                     | component  | Label + control slot + inline error/hint (+ optional `[i]` info)                                                                                             |
| Field wrappers                                  | component  | `TextField`, `TextareaField`, `NumberField`, `SelectField`, `ComboboxField`, `CheckboxField`, `RadioGroupField`, `SwitchField`, `JsonField`, `RichTextField` |
| `PreviewCard`                                   | component  | Compact list-row card with optional `onSelect` button root; used by `ButtonDropdown` and `RichTextLinkPreviewCard`                                           |
| `ButtonDropdown`                                | component  | Button trigger + searchable grouped popover for template pickers (`enableSearch` default `true`)                                                             |
| `FileDropzone`                                  | component  | Drag-and-drop / click-to-browse file primitive; controlled (`value`/`onChange: File[]`); MIME validation, previews, remove                                   |
| `FileField`                                     | component  | `FormField`-shim wrapper around `FileDropzone` — adds label, hint, error, `[i]` info                                                                         |
| `FieldGroup`, `FieldRow`                        | component  | Layout: semantic fieldset/legend group; responsive token-width row                                                                                           |
| `Tooltip` + `InfoTooltip`                       | component  | Radix tooltip parts + the focusable `[i]` info pattern                                                                                                       |
| `Modal` (compound)                              | component  | `Modal.Root/Trigger/Content/Header/Body/Footer/Close` on Radix Dialog; `size`, `closeOnOutsideClick`, `closeOnEscape`                                        |
| `useModal`                                      | hook       | Modal open/close state + promise-based `confirm()` + guarded-close helpers                                                                                   |
| `ConfirmDialog`                                 | component  | Radix AlertDialog "are you sure?"; pairs with `useModal`'s guarded close                                                                                     |
| `RichTextEditor`, `sanitizeHtml`                | component  | Tiptap HTML-string editor + the mandatory render-time sanitizer                                                                                              |
| `Heading`, `Text`, `RichTextContent`            | component  | App copy primitives + sanitized HTML prose; see [Typography](#typography) below                                                                              |
| `FormCard`, `formCardContentClass`              | component  | Card chrome (header + body slot, no `<form>`); render a `<Form>` inside it                                                                                   |
| `SubmitButton`, `SubmitButtonProps`             | component  | `type="submit"` button with pending state + label                                                                                                            |
| `Spinner`, `SpinnerProps`, `spinnerVariants`    | component  | Accessible loading indicator; `variant` (`muted` default, `foreground`); `size` (`sm` … `xl`)                                                                |
| `Wizard`, `WizardFooter`, `useWizard`           | component  | Multi-step form wizard; schema-agnostic; per-step `<Form>` pattern; see [Wizard pattern](#wizard-pattern) below                                              |
| `@rpg/ui/form`                                  | subpath    | Schema-driven `<Form>` renderer (the only `react-hook-form`-aware layer); source layout → [`src/form/README.md`](src/form/README.md)                         |
| `@rpg/ui/styles.css`                            | stylesheet | Tailwind + design tokens (the shared "preset")                                                                                                               |
| `@rpg/ui/lib/utils`                             | util       | Direct path to `cn` for shadcn's CLI alias                                                                                                                   |

Interactive primitives (`Button`, `Input`) carry `"use client"` so they work
inside Next.js Server Components.

## Consuming the preset

Tailwind v4 is configured in CSS, so there is no JS preset file — apps import
this package's stylesheet once at their root, then add the package source to
Tailwind's content scan.

```ts
// app root (Next.js layout or Vite main.tsx)
import '@rpg/ui/styles.css'
```

```css
/* the app's own globals.css */
@import 'tailwindcss';
@source "../../node_modules/@rpg/ui/src";
```

The stylesheet defines CSS-variable design tokens on `:root` and `.dark`; toggle
the `dark` class on a root element to switch themes. The palette is a warm
amber/gold primary over parchment-tinted neutrals (light) and warm charcoal
(dark); all text/background token pairings meet WCAG 2.2 AA.

### Fonts

The preset defines two font tokens — `--font-sans` (body) and `--font-display`
(semantic alias for future display-font rollout; prose headings use it today).
Apps provide the Inter face:

- **Next.js (public)**: load via `next/font` with `variable: '--font-body'` on
  the `<html>` element. `--font-display` resolves through that variable.
- **Vite (dashboard, Storybook)**: import `@fontsource-variable/inter`; its
  family name matches the token fallback (`'Inter Variable'`).

If an app loads neither, the tokens fall back to system stacks.

## Typography

Copy uses two layers: **`Heading` / `Text`** for app chrome, **`RichTextContent`**
for sanitized HTML. Do not wrap whole pages in `prose`.

Full guide — hierarchy table, `RichTextContent` contract, dark mode, and internal
primitive rules: **[docs/typography.md](docs/typography.md)**.

```tsx
import { Heading, Text, RichTextContent } from '@rpg/ui'

<Heading variant="page" as="h1">{item.name}</Heading>
<Text variant="muted">{item.description}</Text>
<RichTextContent html={trait.description} size="md" tone="muted" />
```

## Importing components

Low-level primitives compose directly:

```tsx
import { Button, Card, CardHeader, CardTitle, Input } from '@rpg/ui'

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
      </CardHeader>
      <Input aria-label="Email" type="email" />
      <Button>Continue</Button>
    </Card>
  )
}
```

For forms, prefer the schema-driven `<Form>` (see [Forms](#forms) below). `FormCard`
is the card-shaped chrome it renders into — a header above a body slot, with **no
`<form>` of its own** — so a `<Form>` child owns the single form element. Pass
`formCardContentClass` to the `<Form>`'s `contentClassName` so the fields inset
like `CardContent`.

```tsx
import { CardFooter, FormCard, SubmitButton, formCardContentClass } from '@rpg/ui'
import { Form } from '@rpg/ui/form'

export function SignInForm({ onSubmit, formError }) {
  return (
    <FormCard
      title="Sign in"
      description="Enter your details to continue."
      className="w-full max-w-sm"
    >
      <Form
        schema={loginInputSchema}
        fields={[{ type: 'text', name: 'email', label: 'Email', inputType: 'email' }]}
        onSubmit={onSubmit}
        formError={formError}
        contentClassName={formCardContentClass}
        footer={(form) => (
          <CardFooter className="justify-end">
            <SubmitButton pending={form.formState.isSubmitting} pendingLabel="Signing in…">
              Continue
            </SubmitButton>
          </CardFooter>
        )}
      />
    </FormCard>
  )
}
```

## Forms

The form system is two layers: RHF-agnostic field primitives (compound `Field.*`,
the typed wrappers, `FieldGroup`/`FieldRow`) imported from `@rpg/ui`, and a
schema-driven `<Form>` renderer — the only `react-hook-form`-aware surface —
imported from the `@rpg/ui/form` subpath:

```tsx
import { Form } from '@rpg/ui/form'
;<Form schema={schema} fields={fields} onSubmit={onSubmit} />
```

See **[docs/forms.md](docs/forms.md)** for the hub guide (layers, a11y, rhythm, validation,
RHF boundary). Deep reference lives in **[docs/forms/](docs/forms/)** — field types,
containers, sizing tokens, and layout patterns.

## File uploads

`FileDropzone` is a controlled primitive for drag-and-drop or click-to-browse
file selection. `FileField` is the standard `FormField`-shim wrapper that adds a
label, hint, and error message. The form value is `File[]` — consumers own the
upload step.

### Standalone (with your own `useForm`)

```tsx
import { FileField } from '@rpg/ui'

function AvatarUpload() {
  const [files, setFiles] = useState<File[]>([])
  return (
    <FileField
      id="avatar"
      label="Campaign banner"
      hint="JPEG, PNG, WebP or GIF. Max 5 MB."
      value={files}
      onChange={setFiles}
    />
  )
}
```

### Inside the schema-driven `<Form>`

Add `type: 'file'` to the `fields` array. The form value for the field will be
`File[]`:

```tsx
import { Form } from '@rpg/ui/form'
import { z } from 'zod'

const fileValidator = z.custom<File>((v) => v instanceof File, 'Must be a file')

const schema = z.object({
  name: z.string().min(1),
  banner: fileValidator.array().min(1, 'A banner image is required'),
})

<Form
  schema={schema}
  fields={[
    { type: 'text', name: 'name', label: 'Campaign name', required: true },
    {
      type: 'file',
      name: 'banner',
      label: 'Banner image',
      hint: 'JPEG, PNG, WebP or GIF. Max 5 MB.',
      required: true,
      accept: ['image/*'],
      maxSize: 5_242_880,
    },
  ]}
  onSubmit={async (values) => {
    // values.banner is File[] — call POST /api/uploads to persist
    const formData = new FormData()
    formData.append('file', values.banner[0])
    const res = await fetch('/api/uploads', {
      method: 'POST',
      body: formData,
      headers: { 'x-csrf-token': csrfToken },
    })
    const { key } = await res.json()
    await saveCampaign({ ...values, imageKey: key })
  }}
/>
```

### `FileDropzone` props

| Prop       | Type                      | Default       | Description                                |
| ---------- | ------------------------- | ------------- | ------------------------------------------ |
| `value`    | `File[]`                  | `[]`          | Current file list (controlled)             |
| `onChange` | `(files: File[]) => void` | —             | Called when files are added or removed     |
| `accept`   | `string[]`                | `['image/*']` | MIME types or extensions (e.g. `['.pdf']`) |
| `multiple` | `boolean`                 | `false`       | Allow multiple files                       |
| `maxFiles` | `number`                  | —             | Cap on number of files (when `multiple`)   |
| `maxSize`  | `number`                  | —             | Max bytes per file                         |
| `disabled` | `boolean`                 | `false`       | Disables all interaction                   |

### Rendering stored images

Use `getAssetUrl` from `@rpg/contracts` to resolve a stored key to a URL. Never
store the full URL — store the key and resolve at render time:

```tsx
import { getAssetUrl } from '@rpg/contracts'
;<img src={getAssetUrl(campaign.imageKey)} alt={campaign.name} />
```

CDN upgrade: set `STORAGE_BASE_URL=https://cdn.example.com` — zero code changes.

## Adding a new shadcn primitive

A primitive follows the CVA file layout (all under `src/components/ui/`):

```text
index.ts            # barrel re-export
<name>.variants.ts  # all CVA / Tailwind classes live here
<name>.tsx          # component (server) — or <name>.client.tsx if interactive
<name>.stories.tsx  # CSF3 story (required for every component)
<name>.types.ts     # optional shared types
```

1. Put **all** Tailwind classes in `<name>.variants.ts` via `cva` — prefer named
   CVA variants over long inline strings. Use design-token classes only; never
   hardcode color values or font sizes. The shadcn CLI can scaffold a starting
   point: `pnpm dlx shadcn@latest add <name>` (config lives in `components.json`).
2. The component file composes classes with `cn` from `../../lib/utils` (match the
   new-york style of the existing primitives). If it is interactive, name it
   `<name>.client.tsx` and add `'use client'` at the top so Next.js RSC works; a
   non-interactive (server) component is `<name>.tsx` with no directive.
3. Re-export it from `src/index.ts`.
4. Add a co-located `<name>.stories.tsx` for **every** component (CSF3), and a
   co-located `<name>.test.tsx` for logic-bearing or interactive components. Every
   UI/interactive component must pass vitest-axe and the Storybook test runner's
   axe-playwright check, and introduce no `eslint-plugin-jsx-a11y` violations
   (target WCAG 2.2 AA); never suppress axe rules globally.

> Note: all interactive primitives now follow these conventions — `*.client.tsx`
> for client components (`button`, `input`, `avatar`, `dropdown-menu`,
> `sidebar-trigger`) with their CVA classes in a `*.variants.ts` sibling. Non-
> interactive (server) primitives correctly stay as plain `*.tsx` with no directive.

## Wizard pattern

`Wizard` is a **schema-agnostic** multi-step form container. Each step owns its
own `<Form>` (with its own Zod schema); the wizard accumulates values across
steps and delivers all of them to `onComplete` when the last step is submitted.

### Per-step `WizardStepForm` pattern

Schema-driven steps should use `WizardStepForm` (`@rpg/ui/form`), which wires
the standard step skeleton — `mode="onChange"`, submit via `completeStep`, and a
`WizardFooter` — and seeds its defaults from the wizard's accumulated values so
navigating Back restores what was entered. Keep step values **flat** (map to
nested API shapes at `onComplete` time), otherwise they can't be seeded back.

```tsx
import { Wizard, WizardFooter, useWizard, type WizardStepDef } from '@rpg/ui'
import { WizardStepForm } from '@rpg/ui/form'
import { z } from 'zod'

const STEPS: WizardStepDef[] = [
  { id: 'info', label: 'Info' },
  { id: 'review', label: 'Review' },
]

const infoSchema = z.object({ name: z.string().min(1) })
const infoFields = [{ type: 'text', name: 'name', label: 'Name', required: true }]

function ReviewStep() {
  const { accumulatedValues, complete } = useWizard()
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void complete()
      }}
    >
      <p>Name: {String(accumulatedValues.name)}</p>
      <WizardFooter submitLabel="Finish" />
    </form>
  )
}

function MyWizard() {
  return (
    <Wizard
      steps={STEPS}
      onComplete={async (values) => {
        /* save values */
      }}
      hint="You can change these settings later."
    >
      <WizardStepForm schema={infoSchema} fields={infoFields} />
      <ReviewStep />
    </Wizard>
  )
}
```

### API summary

| Export                              | Role                                                                                     |
| ----------------------------------- | ---------------------------------------------------------------------------------------- |
| `<Wizard>`                          | Root container. Owns step index + accumulated values. Renders only the active step       |
| `useWizard()`                       | Hook for step components. Returns `completeStep`, `retreat`, `complete`, etc.            |
| `<WizardFooter>`                    | Back / Next / Submit buttons. Reads `isCompleting` from context automatically            |
| `<WizardStepNav>`                   | Progress bar rendered inside `<Wizard>` automatically; also exported for custom layouts  |
| `<WizardStepForm>` (`@rpg/ui/form`) | A schema-driven step: `<Form mode="onChange">` + `WizardFooter` + Back-restore via seeds |

Hand-rolled steps (custom controls, read-only review) keep using `useWizard()`
directly; pass `mode="onChange"` to a hand-wired step `<Form>` so
`formState.isValid` updates reactively and can disable the Next button.

## Running Storybook

This package owns the **design-system** Storybook (`:6006`). Dashboard
composition stories (content detail routes, data-table columns, layout shells)
live in `@rpg/dashboard` Storybook (`:6007`) — see
[docs/running.md](../../docs/running.md#storybook).

Shared main/preview config comes from
[`@rpg/config/storybook`](../config/README.md#storybook). UI-specific preview
wiring adds `@rpg/ui/storybook/with-theme-context` so `useTheme()` and the
theme-switch story match the Storybook toolbar.

```sh
pnpm storybook:ui              # from repo root
pnpm --filter @rpg/ui storybook # equivalent filter command
pnpm --filter @rpg/ui build-storybook
```

The a11y addon runs axe against every story; shared preview sets `a11y.test` to
`error`, so violations surface as CI failures (see
[Storybook A11y workflow](../../.github/workflows/storybook-a11y.yml)).

## Scripts

| Script                 | Description                                     |
| ---------------------- | ----------------------------------------------- |
| `pnpm build`           | Emit `dist` type declarations via tsc           |
| `pnpm typecheck`       | `tsc --noEmit` (includes tests + stories)       |
| `pnpm lint`            | ESLint (incl. Storybook rules)                  |
| `pnpm test`            | Vitest: Button render + axe a11y checks (jsdom) |
| `pnpm storybook`       | Storybook dev server                            |
| `pnpm build-storybook` | Static Storybook build                          |
