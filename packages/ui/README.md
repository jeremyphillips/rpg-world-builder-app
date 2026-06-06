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

| Export                                    | Kind       | Notes                                          |
| ----------------------------------------- | ---------- | ---------------------------------------------- |
| `cn`                                      | util       | `clsx` + `tailwind-merge` class composer       |
| `Button`, `buttonVariants`, `ButtonProps` | component  | 6 variants (`default` … `link`), 4 sizes       |
| `Input`                                   | component  | Styled text input                              |
| `Card` + subcomponents                    | component  | `CardHeader/Title/Description/Content/Footer`  |
| `@rpg/ui/styles.css`                      | stylesheet | Tailwind + design tokens (the shared "preset") |
| `@rpg/ui/lib/utils`                       | util       | Direct path to `cn` for shadcn's CLI alias     |

Interactive primitives (`Button`, `Input`) carry `"use client"` so they work
inside Next.js Server Components.

## Consuming the preset

Tailwind v4 is configured in CSS, so there is no JS preset file — apps import
this package's stylesheet once at their root, then add the package source to
Tailwind's content scan.

```ts
// app root (Next.js layout or Vite main.tsx)
import "@rpg/ui/styles.css";
```

```css
/* the app's own globals.css */
@import "tailwindcss";
@source "../../node_modules/@rpg/ui/src";
```

The stylesheet defines CSS-variable design tokens on `:root` and `.dark`; toggle
the `dark` class on a root element to switch themes.

## Importing components

```tsx
import { Button, Card, CardHeader, CardTitle, Input } from "@rpg/ui";

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
      </CardHeader>
      <Input aria-label="Email" type="email" />
      <Button>Continue</Button>
    </Card>
  );
}
```

## Adding a new shadcn primitive

1. Add the component file under `src/components/ui/<name>.tsx`, composing classes
   with `cn` from `../../lib/utils` (match the new-york style of the existing
   primitives). The shadcn CLI can scaffold it: `pnpm dlx shadcn@latest add <name>`
   (config lives in `components.json`).
2. If it is interactive, add `"use client"` at the top so Next.js RSC works.
3. Re-export it from `src/index.ts`.
4. Add a story in `src/stories/<name>.stories.tsx` and, for logic-bearing
   components, a co-located `*.test.tsx`.

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
