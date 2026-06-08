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

| Export                                    | Kind       | Notes                                                                    |
| ----------------------------------------- | ---------- | ------------------------------------------------------------------------ |
| `cn`                                      | util       | `clsx` + `tailwind-merge` class composer                                 |
| `Button`, `buttonVariants`, `ButtonProps` | component  | 6 variants (`default` … `link`), 4 sizes                                 |
| `Input`                                   | component  | Styled text input                                                        |
| `Card` + subcomponents                    | component  | `CardHeader/Title/Description/Content/Footer`                            |
| `FormField`                               | component  | Label + control slot + inline error/hint                                 |
| `TextField`, `TextFieldProps`             | component  | `FormField` + `Input`; derives `aria-invalid` from `error`, forwards ref |
| `FormCard`                                | component  | Card-shaped form shell: header + `<form>` + error alert + footer slot    |
| `SubmitButton`, `SubmitButtonProps`       | component  | `type="submit"` button with pending state + label                        |
| `@rpg/ui/styles.css`                      | stylesheet | Tailwind + design tokens (the shared "preset")                           |
| `@rpg/ui/lib/utils`                       | util       | Direct path to `cn` for shadcn's CLI alias                               |

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

For forms, prefer the higher-level helpers — `FormCard` (header + `<form>` + error
alert + footer), `TextField` (labelled, validation-aware input), and `SubmitButton`
(pending state). They are UI-only and pair cleanly with `react-hook-form`: spread
`register(...)` onto `TextField` and it forwards the ref.

```tsx
import { CardFooter, FormCard, SubmitButton, TextField } from '@rpg/ui'

export function SignInForm({ onSubmit, formError }) {
  return (
    <FormCard
      title="Sign in"
      description="Enter your details to continue."
      onSubmit={onSubmit}
      formError={formError}
      className="w-full max-w-sm"
      footer={
        <CardFooter className="justify-end">
          <SubmitButton pending={false} pendingLabel="Signing in…">
            Continue
          </SubmitButton>
        </CardFooter>
      }
    >
      <TextField id="email" label="Email" type="email" autoComplete="email" />
    </FormCard>
  )
}
```

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

> Note: some existing primitives (e.g. `button-variants.ts`) predate the dotted
> `*.variants.ts` naming and the `*.client.tsx` suffix. New work follows the
> conventions above; existing files are migrated opportunistically, not in bulk.

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
