# AGENTS.md

Guidance for AI agents working in this repo. Concise by design — follow the
links for depth. See [docs/architecture.md](docs/architecture.md) for the
system overview.

## Quality gate

Work is **not done** until the pre-commit gate passes. The source of truth is
[`.husky/pre-commit`](.husky/pre-commit); if this list drifts, the hook wins.
Currently:

```text
pnpm lint-staged → pnpm typecheck → pnpm coverage → fallow dupes --production --format human → fallow health --production --complexity --coverage --format human
```

## fallow (code health)

Use the `/fallow` skill for code-health work. Use judgement per finding: fix it
in code, or — if a fix isn't worth it — propose an inline suppression or a
`.fallowrc.json` tweak and **consult the user before ignoring**. Production
complexity thresholds live in `.fallowrc.json` `health`; CRAP uses Istanbul
coverage from `pnpm coverage` via `--coverage ./coverage/coverage-final.json`.

## Types

- Domain/DTO shapes are Zod schemas in `@rpg/contracts` — the single source of
  truth. Never redefine those shapes in apps (contracts-first).
- Prefer `Pick` / `Omit` / `Partial` / `extends` over duplicating type shapes.

## Constants

Any string literal used in 2+ places → extract to a named constant.

## Storybook (dashboard)

No nested routers in `*.stories.tsx` (preview provides `MemoryRouter`) — [.cursor/rules/storybook-router.mdc](.cursor/rules/storybook-router.mdc). Port **6007**; primitives → `@rpg/ui` Storybook (`:6006`).

## Components

- Every component gets a co-located `*.stories.tsx` (CSF3); logic-bearing or
  interactive components also get a co-located `*.test.tsx`.
- Client component: `<name>.client.tsx` with `'use client'`. Server component:
  `<name>.tsx` (no directive).
- Shared primitives live in `packages/ui` so both `dashboard` and `public` can
  consume them. Authoring detail → [packages/ui/README.md](packages/ui/README.md).
- Forms: prefer the schema-driven `<Form>` (`@rpg/ui/form`) — the only
  `react-hook-form`-aware surface — over hand-wiring primitives. Layer choice,
  the a11y contract, `size`/`width` tokens, and conditional fields are documented
  in [packages/ui/docs/forms.md](packages/ui/docs/forms.md). Dashboard feature
  `lib/` form modules (`*-form-fields`, `*-form-values`, …) →
  [apps/dashboard/docs/form-lib-conventions.md](apps/dashboard/docs/form-lib-conventions.md).

## Accessibility

Target WCAG 2.2 AA. Every UI/interactive component must pass vitest-axe
assertions, the Storybook test runner's axe-playwright check, and introduce no
`eslint-plugin-jsx-a11y` violations. Do not suppress axe rules globally.

## Design tokens

Never hardcode color values or font sizes — use design-token classes. Tailwind
classes belong in `*.variants.ts` via CVA, not long inline strings.

## Feature boundaries

- Feature folder layout (`routes/`, `components/`, `hooks/`, `api/`, `lib/`, …) →
  [apps/dashboard/docs/feature-structure.md](apps/dashboard/docs/feature-structure.md).
- Cross-feature imports go only through the feature's `index.ts` barrel
  (ESLint-enforced). Detail →
  [apps/dashboard/docs/feature-conventions.md](apps/dashboard/docs/feature-conventions.md).
- Dashboard data access goes through TanStack Query, not ad-hoc `fetch` in
  components.

## Same-origin API

All apps sit behind one origin (see [docs/architecture.md](docs/architecture.md)).
Call the API with relative paths (`fetch('/api/...')`) — never hardcode an origin
or `localhost` port. Send the CSRF token header on state-changing requests
(POST/PUT/PATCH/DELETE).

## Auth model

The session is a host-only `httpOnly` cookie plus a readable CSRF token
(double-submit). Login/signup live **only** in the public app; the dashboard
gates itself via `GET /api/auth/me`. Don't read the session cookie in client code
or duplicate auth flows into the dashboard.

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
