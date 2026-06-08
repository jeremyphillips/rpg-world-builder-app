# AGENTS.md

Guidance for AI agents working in this repo. Concise by design — follow the
links for depth. See [docs/architecture.md](docs/architecture.md) for the
system overview.

## Quality gate

Work is **not done** until the pre-commit gate passes. The source of truth is
[`.husky/pre-commit`](.husky/pre-commit); if this list drifts, the hook wins.
Currently:

```text
pnpm lint-staged → pnpm typecheck → pnpm test → fallow --format human --production-dupes
```

## fallow (code health)

Use the `/fallow` skill for code-health work. Use judgement per finding: fix it
in code, or — if a fix isn't worth it — propose an inline suppression or a
`.fallowrc.json` tweak and **consult the user before ignoring**.

## Types

- Domain/DTO shapes are Zod schemas in `@rpg/contracts` — the single source of
  truth. Never redefine those shapes in apps (contracts-first).
- Prefer `Pick` / `Omit` / `Partial` / `extends` over duplicating type shapes.

## Constants

Any string literal used in 2+ places → extract to a named constant.

## Components

- Every component gets a co-located `*.stories.tsx` (CSF3); logic-bearing or
  interactive components also get a co-located `*.test.tsx`.
- Client component: `<name>.client.tsx` with `'use client'`. Server component:
  `<name>.tsx` (no directive).
- Shared primitives live in `packages/ui` so both `dashboard` and `public` can
  consume them. Authoring detail → [packages/ui/README.md](packages/ui/README.md).

## Accessibility

Target WCAG 2.2 AA. Every UI/interactive component must pass vitest-axe
assertions, the Storybook test runner's axe-playwright check, and introduce no
`eslint-plugin-jsx-a11y` violations. Do not suppress axe rules globally.

## Design tokens

Never hardcode color values or font sizes — use design-token classes. Tailwind
classes belong in `*.variants.ts` via CVA, not long inline strings.

## Feature boundaries

- Cross-feature imports go only through the feature's `index.ts` barrel
  (ESLint-enforced). Detail →
  [apps/dashboard/docs/feature-conventions.md](apps/dashboard/docs/feature-conventions.md).
- Dashboard data access goes through TanStack Query, not ad-hoc `fetch` in
  components.

## Secrets / RSC boundary

No secrets in client bundles. Respect the Next.js server/client boundary —
secret `process.env` access must stay out of `'use client'` modules (this is
what fallow's client-server-leak check guards).

## Git safety

Run `git status --short` before deleting anything. Never remove untracked files
or directories without explicit instruction.

## Documentation

Before closing a task, check whether any file in `*/docs/` needs updating. If
unsure, ask. Recommend a new doc when substantial work has no existing home.

## Commits

Use Conventional Commits (commitlint-enforced).
