# AGENTS.md

Guidance for AI agents working in this repo. Concise by design — follow the
links for depth. See [docs/architecture.md](docs/architecture.md) for the
system overview.

## Project stage

This is a **dev-only** project — no production users or live data. When
changing schemas (MongoDB, Zod contracts in `@rpg/contracts`, catalog JSON,
etc.), prefer the direct, clean shape over backward-compatible migrations. Do
not add migration scripts, versioned transforms, or dual-read paths unless the
user explicitly asks.

## Quality gate

Work is **not done** until the tiered gates pass. Hook scripts are the source of
truth ([`.husky/pre-commit`](.husky/pre-commit),
[`.husky/pre-push`](.husky/pre-push)); package scripts in root `package.json`
(`gate:*`, `*:affected`) must stay in sync.

**Pre-commit** (fast, affected scope — packages changed since `HEAD` plus
dependents via Turbo):

```text
pnpm lint-staged → regenerate JSON schemas (when @rpg/contracts Zod inputs change) → pnpm gate:fallow-health → pnpm gate:fallow-dupes → pnpm lint:affected → pnpm typecheck:affected → pnpm test:affected
```

**Pre-push** (full suite before sharing):

```text
pnpm gate:pre-push  →  pnpm coverage → pnpm gate:fallow-health:coverage → pnpm build
```

`pnpm build` excludes `@rpg/bench` (internal dev tooling). Use `pnpm build:bench`
when you need a production bundle of the bench app.

**CI** mirrors pre-push coverage and fallow checks on every PR, with affected
Turbo scope for typecheck, lint, and build (`gate:ci:quality`, `build:ci`). Skip hooks
locally only when necessary: `HUSKY=0 git commit` / `HUSKY=0 git push`.

## fallow (code health)

Use the `/fallow` skill for code-health work. Use judgement per finding: fix it
in code, or — if a fix isn't worth it — propose an inline suppression or a
`.fallowrc.json` tweak and **consult the user before ignoring**. Production
complexity thresholds live in `.fallowrc.json` `health`; CRAP uses Istanbul
coverage from `pnpm coverage` via `--coverage ./coverage/coverage-final.json`
(pre-push and CI — not pre-commit).

## Agent skills

| Skill                                                          | Use when                                                                                                       |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [`new-content-type`](.cursor/skills/new-content-type/SKILL.md) | Adding or auditing a top-level catalog content type (contracts, catalog, API, dashboard, integration manifest) |
| [`spell-resolution`](.cursor/skills/spell-resolution/SKILL.md) | Spell resolution, effects, modeling, promotion, resolution UI                                                  |
| [`dev-bench`](.cursor/skills/dev-bench/SKILL.md)               | Capturing gaps and tickets via `pnpm bench`                                                                    |
| [`pr-review`](.cursor/skills/pr-review/SKILL.md)               | Structured PR review — SSOT drift, parallel paths, ownership, styling hacks, silent failures, wiring gaps      |

Policy depth for content types → [`docs/content-types.md`](docs/content-types.md).

## Types

- Domain/DTO shapes are Zod schemas in `@rpg/contracts` — the single source of
  truth. Never redefine those shapes in apps (contracts-first).
- Prefer `Pick` / `Omit` / `Partial` / `extends` over duplicating type shapes.

## Constants

Any string literal used in 2+ places → extract to a named constant.

Closed vocabulary maps in `@rpg/contracts` use a two-layer pattern: `*_TERM`
(the set concept) plus `*_ENTRIES` (per-value labels). New `*_ENTRIES` maps
require a sibling `*_TERM` — see
[packages/contracts/docs/structure.md](packages/contracts/docs/structure.md#reference-vocabulary-gametermentry).

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
- Entity surfaces: do not add consumer-local spacing, typography, border, radius,
  alignment, divider, or chrome overrides to `EntityItem`,
  `ContentEntityCard`, or `DisclosureEntityCard`. First determine whether the
  change belongs to the shared surface; genuine domain layout remains inside DEC
  children. See [content-entity-card.md](apps/dashboard/docs/content-entity-card.md).

## Accessibility

Target WCAG 2.2 AA. Vitest axe assertions (`itAxe` / `expectNoAxeViolations`)
run in **CI only** (`CI=true` or local `FORCE_AXE=1`); Storybook's axe-playwright
check and `eslint-plugin-jsx-a11y` run on every PR. Do not suppress axe rules globally.

## Design tokens

Never hardcode color values or font sizes — use design-token classes. Tailwind
classes belong in `*.variants.ts` via CVA, not long inline strings.

- Components consume Layer 2 / Tailwind utilities only — never `--palette-*`.
- Prefer named surfaces (`bg-background`, `bg-muted`, `bg-sunken`, `bg-card`) over
  opacity modifiers (`bg-muted/30`) in new code.
- Field chrome: use `field-input-chrome.variants.ts`; do not ad-hoc disabled/muted stacks.
- Status tones: `neutral | info | success | warning | destructive` (Badge, SemanticText, …).

Detail: [packages/ui/docs/design-tokens.md](packages/ui/docs/design-tokens.md).

## Feature boundaries

- Feature folder layout (`routes/`, `components/`, `hooks/`, `api/`, `lib/`, …) →
  [apps/dashboard/docs/feature-structure.md](apps/dashboard/docs/feature-structure.md).
- Cross-feature imports go only through the feature's `index.ts` barrel
  (ESLint-enforced). Detail →
  [apps/dashboard/docs/feature-conventions.md](apps/dashboard/docs/feature-conventions.md).
- Dashboard data access goes through TanStack Query, not ad-hoc `fetch` in
  components.
- Campaign availability reasons (inactive badges/alerts on authoring surfaces) →
  [apps/dashboard/docs/availability.md](apps/dashboard/docs/availability.md).

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
