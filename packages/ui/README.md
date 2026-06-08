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

| Export                                    | Kind       | Notes                                                                                                                                       |
| ----------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `cn`                                      | util       | `clsx` + `tailwind-merge` class composer                                                                                                    |
| `Button`, `buttonVariants`, `ButtonProps` | component  | 6 variants (`default` … `link`), 4 sizes                                                                                                    |
| `Input`                                   | component  | Styled text input                                                                                                                           |
| `Card` + subcomponents                    | component  | `CardHeader/Title/Description/Content/Footer`                                                                                               |
| `Field` (compound)                        | component  | `Field.Root/Label/Control/Hint/Error`; centralizes id + aria wiring                                                                         |
| `FormField`                               | component  | Label + control slot + inline error/hint (+ optional `[i]` info)                                                                            |
| Field wrappers                            | component  | `TextField`, `TextareaField`, `NumberField`, `SelectField`, `CheckboxField`, `RadioGroupField`, `SwitchField`, `JsonField`, `RichTextField` |
| `FieldGroup`, `FieldRow`                  | component  | Layout: semantic fieldset/legend group; responsive token-width row                                                                          |
| `Tooltip` + `InfoTooltip`                 | component  | Radix tooltip parts + the focusable `[i]` info pattern                                                                                      |
| `Modal` (compound)                        | component  | `Modal.Root/Trigger/Content/Header/Body/Footer/Close` on Radix Dialog; `size`, `closeOnOutsideClick`, `closeOnEscape`                       |
| `useModal`                                | hook       | Modal open/close state + promise-based `confirm()` + guarded-close helpers                                                                  |
| `ConfirmDialog`                           | component  | Radix AlertDialog "are you sure?"; pairs with `useModal`'s guarded close                                                                    |
| `RichTextEditor`, `sanitizeHtml`          | component  | Tiptap HTML-string editor + the mandatory render-time sanitizer                                                                             |
| `FormCard`, `formCardContentClass`        | component  | Card chrome (header + body slot, no `<form>`); render a `<Form>` inside it                                                                  |
| `SubmitButton`, `SubmitButtonProps`       | component  | `type="submit"` button with pending state + label                                                                                           |
| `@rpg/ui/form`                            | subpath    | Schema-driven `<Form>` renderer (the only `react-hook-form`-aware layer)                                                                    |
| `@rpg/ui/styles.css`                      | stylesheet | Tailwind + design tokens (the shared "preset")                                                                                              |
| `@rpg/ui/lib/utils`                       | util       | Direct path to `cn` for shadcn's CLI alias                                                                                                  |

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
the `dark` class on a root element to switch themes.

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

See **[docs/forms.md](docs/forms.md)** for the full guide: when to use which layer,
the field anatomy + a11y contract, the `size`/`width` token scales (with the XdY
recipe), contracts-first validation, the RHF boundary, rich-text/JSON handling,
and conditional fields.

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

## Running Storybook

```sh
pnpm --filter @rpg/ui storybook         # dev server on :6006
pnpm --filter @rpg/ui build-storybook   # static build (verification)
```

The a11y addon runs axe against every story; `preview.ts` sets it to `error`,
so violations surface as failures.

## Scripts

| Script                 | Description                                     |
| ---------------------- | ----------------------------------------------- |
| `pnpm build`           | Emit `dist` type declarations via tsc           |
| `pnpm typecheck`       | `tsc --noEmit` (includes tests + stories)       |
| `pnpm lint`            | ESLint (incl. Storybook rules)                  |
| `pnpm test`            | Vitest: Button render + axe a11y checks (jsdom) |
| `pnpm storybook`       | Storybook dev server                            |
| `pnpm build-storybook` | Static Storybook build                          |
