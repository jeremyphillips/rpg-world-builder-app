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

Hook scripts define **repository checkpoints** ([`.husky/pre-commit`](.husky/pre-commit),
[`.husky/pre-push`](.husky/pre-push)); package scripts in root `package.json`
(`gate:*`, `*:affected`) must stay in sync with those hooks. Agents invoke hooks
only when the user asks for the matching checkpoint (see below)—not after every task.

### Agent validation (default)

For normal Cursor work, finish after **focused validation** of changed behavior.

**Do not** run the pre-commit hook, `pnpm gate:pre-push`, root `pnpm build`, or
`pnpm coverage` during ordinary agent tasks unless the user explicitly requests a
**commit/checkpoint**, **push/PR/full validation**, or equivalent.

Default loop:

```text
narrowest relevant Vitest paths → targeted typecheck/lint when useful → broader affected checks only if warranted
```

- **Tests:** `pnpm --filter <pkg> exec vitest run --bail=0 <paths>` (one process, no Turbo).
  For `@rpg/api`, pass `--project api:unit` or `--project api:integration` so pure lib
  tests do not boot Mongo.
- **Types / lint:** package or `pnpm typecheck:affected` / `pnpm lint:affected` when the
  edit needs them—not by default every time.
- **Affected graph:** use `pnpm test:affected`, `pnpm test:affected:local`, or
  `pnpm lint:affected` / `pnpm typecheck:affected` when shared packages, wide blast
  radius, or unclear regressions justify the cost—not as a routine end-of-task step.
  Broad affected typecheck/tests run at **push** via `pnpm gate:pre-push`, not on every
  commit.
- **`pnpm test:affected:gate`:** collect-all package tests on the `…[origin/main]` graph
  (`--continue=always`, failure summary, nonzero when any package fails). Invoked from
  `gate:pre-push`; do not run manually before push unless debugging—the pre-push hook runs it.
- **`pnpm test:affected:collect`:** optional **diagnostic** on the same `...[HEAD]` graph
  (continue after failures, inventory at `.tmp/test-affected-collect.log`). Not required
  before `test:affected:gate` or to finish a task; not a hook or CI gate.

When finishing, **report** which checks ran and which repository gates (pre-commit,
pre-push) were **intentionally deferred**.

### Repository gates (checkpoints)

| User intent                 | What to run                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| Commit / checkpoint         | Pre-commit hook (see sequence below), or the user’s explicit equivalent                       |
| Push / PR / full validation | Pre-commit once, then `pnpm gate:pre-push` once (or `git push`, which runs the pre-push hook) |

**Pre-commit** (fast local checkpoint — cheap checks only):

```text
pnpm lint-staged → regenerate JSON schemas (when @rpg/contracts Zod inputs change) → pnpm gate:fallow-health → pnpm gate:fallow-dupes
```

Commit message format is enforced in **commit-msg** (`commitlint`), after pre-commit succeeds.

**Pre-push** (broad affected correctness before sharing; single script):

```text
pnpm gate:pre-push   # typecheck:ci → test:affected:gate (…[origin/main]) → coverage → gate:fallow-health:coverage → build
```

`pnpm build` excludes `@rpg/bench` (internal dev tooling). Use `pnpm build:bench`
when you need a production bundle of the bench app.

**CI** mirrors pre-push coverage and fallow checks on every PR, with affected
Turbo scope for typecheck, lint, and build (`gate:ci:quality`, `build:ci`). Skip hooks
locally only when necessary: `HUSKY=0 git commit` / `HUSKY=0 git push`.

### Implementation plans

Phased plans must **not** auto-append `test:affected:collect → pre-commit → gate:pre-push`
to every phase or milestone. Prefer the default agent loop above; name **commit** and
**push/PR** checkpoints explicitly when full gates belong in the schedule—not after
each prompt-sized slice of work. Plan footers and verification sections →
[docs/agent-validation.md](docs/agent-validation.md).

## Test failures

Start with explicit Vitest file paths (see **Agent validation**). When many packages
might fail or the root cause is unclear, optionally run `pnpm test:affected:collect`
once to gather a durable inventory (`.tmp/test-affected-collect.log`). It is
diagnostic-only—not a pre-commit, pre-push, CI, or end-of-task gate.

Cluster collect output before editing:

- **Deterministic regression** — same assertion, repeats when that file runs alone.
- **Cascade** — import, setup, `beforeAll`, or provider failure. That is usually
  the highest-confidence shared cause. A widespread failure is not automatically
  the root cause.
- **Infrastructure** — MongoMemoryServer, worker SIGTERM, cancelled Turbo tasks,
  or timeouts while heavy packages run together. Rerun those files serially
  before treating them as product bugs. This matters most for MongoMemoryServer
  failures.
- **Suspected flake** — passes when that file runs alone. Do not batch-fix.

Do not add Vitest retries. Fix the highest-confidence shared cause, then rerun
only the files that failed. Run repository gates only on **commit/checkpoint** or
**push/PR/full validation** requests—not as the default follow-up to a clean collect.

## fallow (code health)

Use the `/fallow` skill for code-health work. Use judgement per finding: fix it
in code, or — if a fix isn't worth it — propose an inline suppression or a
`.fallowrc.json` tweak and **consult the user before ignoring**. Production
complexity thresholds live in `.fallowrc.json` `health`; CRAP uses Istanbul
coverage from `pnpm coverage` via `--coverage ./coverage/coverage-final.json`
(pre-push and CI — not pre-commit).

## Agent skills

| Skill                                                                                  | Use when                                                                                                                 |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [`new-content-type`](.cursor/skills/new-content-type/SKILL.md)                         | Adding or auditing a top-level catalog content type (contracts, catalog, API, dashboard, integration manifest)           |
| [`spell-resolution`](.cursor/skills/spell-resolution/SKILL.md)                         | Spell resolution, effects, modeling, promotion, resolution UI                                                            |
| [`dev-bench`](.cursor/skills/dev-bench/SKILL.md)                                       | Capturing gaps and tickets via `pnpm bench`                                                                              |
| [`pr-review`](.cursor/skills/pr-review/SKILL.md)                                       | Structured PR review — SSOT drift, parallel paths, ownership, styling hacks, silent failures, wiring gaps                |
| [`directory-organization-audit`](.cursor/skills/directory-organization-audit/SKILL.md) | Directory organization strategy for crowded or misaligned folders — ownership, flat vs nested structure, move vs extract |

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
- **Dashboard** (`apps/dashboard`): `<name>.tsx` / `<name>.ts` — no `.client`
  suffix, no `'use client'` directive. The dashboard is a Vite SPA; modules are
  client-rendered by default. See
  [feature-structure.md](apps/dashboard/docs/feature-structure.md#components).
- **`@rpg/ui` and Next.js apps** (`apps/public`): interactive modules use
  `<name>.client.tsx` with `'use client'`; server-safe modules use `<name>.tsx`
  with no directive.
- Shared primitives live in `packages/ui` so both `dashboard` and `public` can
  consume them. Authoring detail → [packages/ui/README.md](packages/ui/README.md).
- Forms: prefer the schema-driven `<Form>` (`@rpg/ui/form`) — the only
  `react-hook-form`-aware surface — over hand-wiring primitives. Layer choice,
  the a11y contract, `size`/`width` tokens, and conditional fields are documented
  in [packages/ui/docs/forms.md](packages/ui/docs/forms.md). Dashboard feature
  `lib/` form modules (`*-form-fields`, `*-form-values`, …) →
  [apps/dashboard/docs/form-lib-conventions.md](apps/dashboard/docs/form-lib-conventions.md).
- Entity surfaces: do not add consumer-local spacing, typography, border, radius,
  alignment, divider, or chrome overrides to `EntityAnatomyHost`,
  `ContentEntityCard`, or `DisclosureEntityCard`. First determine whether the
  change belongs to the shared surface; genuine domain layout remains inside DEC
  children. Ownership hierarchy and per-primitive contracts →
  [content-entity-card.md](apps/dashboard/docs/content-entity-card.md).

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
