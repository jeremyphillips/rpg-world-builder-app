# Feature structure (dashboard)

Canonical layout for every top-level folder under `src/features/`. This doc is
the agent entry point for **all** feature dirs; deep dives live in linked docs
below.

## Feature root

Each feature owns its UI, state, and data access in one ESLint boundary
element:

```text
src/features/<feature>/
  README.md
  index.ts
  routes/  components/  hooks/  api/  lib/
  fixtures.ts          # optional — see Content catalog fixtures
```

| Artifact    | Role                                                                               |
| ----------- | ---------------------------------------------------------------------------------- |
| `index.ts`  | Public barrel — the **only** entry other features may import                       |
| `README.md` | Purpose, key files, related docs (see [README template](#feature-readme-template)) |

The ESLint feature-boundary rule (`@rpg/config/eslint/base`) treats each direct
child of `src/features/` as one boundary. Cross-feature imports go through
`index.ts` only — never another feature's internals. Detail on boundary
enforcement and shared `src/` imports →
[feature-conventions.md](./feature-conventions.md#boundary-rule).

## Folder responsibilities

| Folder        | Responsibility                                                                               |
| ------------- | -------------------------------------------------------------------------------------------- |
| `routes/`     | Route-level screens mounted in the app router                                                |
| `components/` | Feature UI — `*.client.tsx` for client components; co-located `*.stories.tsx` / `*.test.tsx` |
| `hooks/`      | React hooks; TanStack Query pairs with `api/`                                                |
| `api/`        | Same-origin API wrappers (`fetch('/api/...')`); no UI                                        |
| `domain/`     | Optional pure logic, framework-agnostic                                                      |
| `lib/`        | Non-route helpers — see [lib concern index](#lib-concern-index)                              |

### `routes/`

Screen modules lazy-load via [`src/app/lazy-routes.ts`](../src/app/lazy-routes.ts).
Do **not** re-export route screens from `index.ts` — barrel re-exports pin
modules in the entry chunk and defeat code splitting. Side-effect-import
`*-form-def.ts` inside the route chunk so form registries defer with the route.
Full splitting map → [code-splitting.md](./code-splitting.md).

### `components/`

Client components: `<name>.client.tsx` with `'use client'`. Server components:
`<name>.tsx` (no directive). Every component gets co-located `*.stories.tsx`
(CSF3); logic-bearing or interactive components also get `*.test.tsx`.

### `hooks/` and `api/`

Data access uses TanStack Query in hooks, not ad-hoc `fetch` in components.
Hooks call `api/` modules; `api/` modules call same-origin relative paths with
CSRF on state-changing requests.

## `lib/` concern index

`lib/` is not one pattern — split by concern. Use a **subfolder** when a concern
has **3+ related files** (e.g. `classes/lib/subclasses/`,
`campaign/lib/rules/character-configuration/`).

| Concern                   | Pattern                                                                                 | Deep dive                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Schema-driven forms       | `*-form-def`, `*-form-fields`, `*-form-values`, `*-form-labels`                         | [form-lib-conventions.md](./form-lib-conventions.md)                               |
| Detail/list UI data       | `*-stat-rows.ts`, `*-display.ts`, `*-overview-columns.tsx` (co-located `*.stories.tsx`) | [feature-conventions.md](./feature-conventions.md#content-catalog-ui)              |
| Navigation / storage keys | Plain names (`*-routes.ts`, `*-storage.ts`)                                             | Feature README                                                                     |
| Registries                | `*-registry.ts`                                                                         | `homebrew/lib/hub/*-registry.ts`; see [vocabulary.md](../../../docs/vocabulary.md) |
| Cross-type shared helpers | Parent `content/lib/` — concern subfolders below                                        | [content/README.md § `lib/`](../src/features/content/README.md)                    |

**Display registry rule:** when an entity appears on multiple display surfaces (detail route, builder sheet, overview table, etc.), labels and formatted display view models should originate from that entity's `*-display.ts` module. Avoid defining stat labels, summary labels, or repeated metadata formatting inside routes, cards, sheets, or preview components.

Content catalog form module inventory (aligned / pending / exception) →
[form-lib-conventions.md § Inventory](./form-lib-conventions.md#content-catalog-inventory).

### Parent `content/lib/` subfolders

Cross-type helpers live under `src/features/content/lib/` in concern subfolders
(mirror `equipment/lib/shared/`). Sub-area `lib/` keeps per-type form and table
config; parent `lib/` is the shared layer only.

| Subfolder        | Responsibility                                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `fixtures/`      | Story/test IDs and `pick*()` catalog helpers                                                                           |
| `forms/`         | `ContentFormDef` registry, create/edit shells (`shells/`), grant splits (`grants/`), shared field builders (`fields/`) |
| `form-options/`  | Cross-type select options (levels, rich-text link targets)                                                             |
| `overview/`      | List route shell, table column/filter builders, source badge                                                           |
| `detail/`        | Detail layout/resolver, stat rows, edit href, image URL                                                                |
| `master-detail/` | Embedded array editor hooks, row meta, campaign availability, validation                                               |
| `list/`          | Content list API/query factories, client, mutation hooks                                                               |
| `utils/`         | Small shared helpers (e.g. `title-case`)                                                                               |

Interactive widgets (master-detail panels) stay in `content/components/`; feat
prerequisite editing lives under `feats/components/`.

## Nested sub-features

Large features nest sub-areas that reuse the same folder set but are **not**
separate ESLint boundaries:

```text
src/features/content/
  README.md  index.ts  lib/
  species/   classes/  spells/  equipment/  …
    routes/  components/  hooks/  api/  lib/
    fixtures.ts                    # optional per sub-area
```

Imports within a feature (including across sub-areas) are unrestricted. Code
outside the feature imports only through the parent `index.ts`.

Examples: `content/spells/`, `content/skill-proficiencies/`, `content/equipment/weapons/`,
`campaign/lib/rules/`.

Multi-word content types use kebab-case subfolder names matching the API content
type key (`skill-proficiencies/`, not camelCase).

## Fixtures

Story and test fixtures may live at a sub-feature root (`fixtures.ts`) or under
a shared `lib/fixtures/` tree. Content catalog fixture rules →
[feature-conventions.md § Content catalog UI](./feature-conventions.md#content-catalog-ui)
and [content/README.md](../src/features/content/README.md).

## Out of scope (no form-lib suffixes)

These patterns intentionally **do not** follow `*-form-fields` / `*-form-values`
naming:

| Area                       | Pattern                         | Notes                                            |
| -------------------------- | ------------------------------- | ------------------------------------------------ |
| `user/lib/*-fields.ts`     | Profile/settings field builders | Not content `ContentFormDef` modules             |
| `homebrew/lib/vocabulary/` | Vocabulary set editors          | See [vocabulary.md](../../../docs/vocabulary.md) |
| `auth/`                    | No `lib/` folder                | Session gate + thin hooks only                   |

Shared content infra (`content-*-form-fields.ts`, `grant-form-*.ts`, `content-form-registry.ts`,
etc.) is listed as **exception** rows in the form-lib inventory — not per-type
form splits. Feat prerequisite editing (`requirement-editor-*`, `RequirementEditor`)
and species creature-type options live under `feats/lib/` and `species/lib/` respectively.

## Feature README template

Apply when authoring or touching a feature or sub-feature README:

1. **Purpose** — one paragraph: what the area does and how it fits the parent feature.
2. **Key files** — table of paths only (no global layout rules — link here instead).
3. **Related docs** — links to this doc, [form-lib-conventions.md](./form-lib-conventions.md) when forms exist, and domain docs (`content-types.md`, etc.).

Example key-files table:

```markdown
| Area       | Path                          |
| ---------- | ----------------------------- |
| Form def   | `lib/class-form-def.ts`       |
| List route | `routes/classes-overview.tsx` |
```

## Related docs

| Doc                                                  | Use for                                                   |
| ---------------------------------------------------- | --------------------------------------------------------- |
| [feature-conventions.md](./feature-conventions.md)   | Boundary rule, Storybook, page shells, catalog UI recipes |
| [form-lib-conventions.md](./form-lib-conventions.md) | Schema-driven form module splits and inventory            |
| [code-splitting.md](./code-splitting.md)             | Lazy routes, form-def deferral, bundle map                |
| [apps/dashboard/README.md](../README.md)             | App architecture, feature status table                    |
