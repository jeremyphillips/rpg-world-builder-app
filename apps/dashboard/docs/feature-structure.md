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

| Folder        | Responsibility                                                  |
| ------------- | --------------------------------------------------------------- |
| `routes/`     | Route-level screens mounted in the app router                   |
| `components/` | Feature UI — co-located `*.stories.tsx` / `*.test.tsx`          |
| `hooks/`      | React hooks; TanStack Query pairs with `api/`                   |
| `api/`        | Same-origin API wrappers (`fetch('/api/...')`); no UI           |
| `domain/`     | Optional pure logic, framework-agnostic                         |
| `lib/`        | Non-route helpers — see [lib concern index](#lib-concern-index) |

### `routes/`

Screen modules lazy-load via [`src/app/lazy-routes.ts`](../src/app/lazy-routes.ts).
Do **not** re-export route screens from `index.ts` — barrel re-exports pin
modules in the entry chunk and defeat code splitting. Side-effect-import
`*-form-def.ts` inside the route chunk so form registries defer with the route.
Full splitting map → [code-splitting.md](./code-splitting.md).

### `components/`

Components and hooks use `<name>.tsx` / `<name>.ts` — no `.client` suffix and no
`'use client'` directive. The dashboard is a client-rendered Vite SPA; unlike
Next.js apps in this monorepo, filename suffixes do not mark a server/client
boundary here.

Every component gets co-located `*.stories.tsx` (CSF3); logic-bearing or
interactive components also get `*.test.tsx`.

> **`@rpg/ui` and `apps/public`** retain `<name>.client.tsx` + `'use client'` for
> interactive modules. Do not add `.client` or `'use client'` to new dashboard modules.

### `hooks/` and `api/`

Data access uses TanStack Query in hooks, not ad-hoc `fetch` in components.
Hooks call `api/` modules; `api/` modules call same-origin relative paths with
CSRF on state-changing requests.

## `lib/` concern index

`lib/` is not one pattern — split by concern. Use a **subfolder** when a concern
has **3+ related files** (e.g. `classes/lib/subclasses/`,
`campaign/lib/rules/character-configuration/`).

| Concern                   | Pattern                                                                                 | Deep dive                                                                           |
| ------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Schema-driven forms       | `*-form-def`, `*-form-fields`, `*-form-values`, `*-form-labels`                         | [form-lib-conventions.md](./form-lib-conventions.md)                                |
| Detail/list UI data       | `*-stat-rows.ts`, `*-display.ts`, `*-overview-columns.tsx` (co-located `*.stories.tsx`) | [feature-conventions.md](./feature-conventions.md#content-catalog-ui)               |
| Navigation / storage keys | Plain names (`*-routes.ts`, `*-storage.ts`)                                             | Feature README; AppShell sidebar → [sidebar-navigation.md](./sidebar-navigation.md) |
| Registries                | `*-registry.ts`                                                                         | `homebrew/lib/hub/*-registry.ts`; see [vocabulary.md](../../../docs/vocabulary.md)  |
| Cross-type shared helpers | Parent `content/lib/` — concern subfolders below                                        | [content/README.md § `lib/`](../src/features/content/README.md)                     |

**Display registry rule:** when an entity appears on multiple display surfaces (detail route, builder sheet, overview table, etc.), labels and formatted display view models should originate from that entity's `*-display.ts` module. Avoid defining stat labels, summary labels, or repeated metadata formatting inside routes, cards, sheets, or preview components.

Content catalog form module inventory (aligned / pending / exception) →
[form-lib-conventions.md § Inventory](./form-lib-conventions.md#content-catalog-inventory).

### Parent `content/lib/` subfolders

Cross-type helpers live under `src/features/content/lib/` in concern subfolders
(mirror `equipment/lib/shared/`). Sub-area `lib/` keeps per-type form and table
config; parent `lib/` is the shared layer only.

| Subfolder                                        | Responsibility                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `fixtures/`                                      | Story/test IDs and `pick*()` catalog helpers                                                                                                                                                                                                                                                                       |
| `forms/`                                         | Cross-type form infra — `registry/`, `validation/`, `fields/`, `mechanics/`, `grants/` (+ `equipment/`, `proficiency/`), `shells/` (+ lifecycle subfolders); see [`forms/README.md`](../src/features/content/lib/forms/README.md)                                                                                  |
| `form-options/`                                  | Cross-type select options (levels, rich-text link targets)                                                                                                                                                                                                                                                         |
| `overview/`                                      | List route shell, table column/filter builders, source badge; hooks in `overview/hooks/`                                                                                                                                                                                                                           |
| `detail/`                                        | Catalog detail pages (`page/`), hero metadata (`metadata/`), section chrome (`section/`), row chrome (`row/`)                                                                                                                                                                                                      |
| `master-detail/`                                 | Embedded array editor hooks, row meta, campaign availability, validation                                                                                                                                                                                                                                           |
| `list/`                                          | Content list API/query factories, client, mutation hooks                                                                                                                                                                                                                                                           |
| `entity/`                                        | Entity anatomy stack — `summary/`, `anatomy/`, `surfaces/` (`cards/`, `catalog/`, `drawer/`, `drawer/replacement/`); unavailable headings in `summary/entity-unavailable-headings.lib.ts` — see [content-entity-card.md](./content-entity-card.md) for card surfaces                                               |
| `relationship/`                                  | Cross-content relationship interaction semantics and reusable surfaces; `core/`, `list/`, `drawer/`, `nested-create/`, `location-connection/` (adapter) — see [relationship README](../src/features/content/lib/relationship/README.md) and [cross-content-relationship-ui.md](./cross-content-relationship-ui.md) |
| `campaign-access/`                               | Campaign availability form, bulk actions, overview row chrome in `overview/` — see [campaign-access README](../src/features/content/lib/campaign-access/README.md)                                                                                                                                                 |
| `delete/`, `demotion/`, `duplication/`, `usage/` | Content lifecycle dialogs and helpers                                                                                                                                                                                                                                                                              |
| `utils/`                                         | Small shared helpers (e.g. `title-case`, `sortable-array-move`)                                                                                                                                                                                                                                                    |

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

| Area                   | Pattern                         | Notes                                            |
| ---------------------- | ------------------------------- | ------------------------------------------------ |
| `user/lib/*-fields.ts` | Profile/settings field builders | Not content `ContentFormDef` modules             |
| `vocabulary/`          | Vocabulary consumption adapters | See [vocabulary.md](../../../docs/vocabulary.md) |
| `game-terms/`          | Game Terms authoring UI         | See [vocabulary.md](../../../docs/vocabulary.md) |
| `auth/`                | No `lib/` folder                | Session gate + thin hooks only                   |

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

## Character builder ownership model

```text
builder/steps/<step>/     → step-specific composition and workflows
components/<domain>/      → reusable domain capabilities (picker | inventory | acquisition)
lib/<domain>/             → pure cross-surface logic
```

Builder step folders own step-specific UI (proficiency sections/rows, spell
choice/summary cards, equipment package-switch modal). Domain folders under
`components/equipment/`, `components/proficiencies/picker/`, and
`components/spells/picker/` stay reusable. Domain UI must not import from
`components/builder/steps/**`.

## Character builder co-located `*.lib.ts` modules

Under `character/components/`, keep view-model helpers beside the component tree
when the module is tightly coupled to one subtree (drawer row assembly, local
formatting, UI state reducers). Move to `character/lib/<concern>/` only when the
module is reused across components, imported outside the subtree, or is an
independently testable view-model seam.

| Location                                   | Keep co-located when…                                         |
| ------------------------------------------ | ------------------------------------------------------------- |
| `components/picker/*.lib.ts`               | Shared picker chrome (search/sort/filter shell)               |
| `components/equipment/picker/**/*.lib.ts`  | Equipment picker/drawer view models                           |
| `components/spells/picker/*.lib.ts`        | Spell drawer-only helpers                                     |
| `components/proficiencies/picker/*.lib.ts` | Proficiency drawer-only helpers                               |
| `components/connections/*.lib.ts`          | Picker/edit drawer view models (filter/sort stays co-located) |

Package-switch resolution state lives in
`character/lib/equipment/equipment-package-switch-resolution.lib.ts` (pure logic,
no presentation). Modal UI lives in
`character/components/builder/steps/equipment/package-switch/`.

Title membership semantics (`ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE`, radio mappers) live in
`character/lib/organization-membership/organization-membership-title.lib.ts` when reused outside
the connections subtree.

Step orchestration hooks belong in `character/hooks/` (`use-*-step.ts`), not
under `components/builder/steps/`.

## Organizations component layout

`content/organizations/components/` mirrors `lib/` concerns without deep nesting:

| Folder                  | Role                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `create/`               | Create-lifecycle UI only (provider, preset bridge, nested create modal)                                                  |
| `members/`              | Detail members composition (flat filename roles: `*-detail-section`, `*-section`, `*-detail-drawers`, `*-picker-drawer`) |
| `location-connections/` | Detail org→location links (flat: `*-detail-section`, `*-section`, `*-list-row`, `*-link-drawer`)                         |

Flat member and location-connection folders are a local discoverability choice,
not a rule that Organization families must stay flat. Domain contracts and policy
belong in `organizations/lib/members/` and `organizations/lib/location-connections/`.
Feature drawers compose shared primitives from `content/lib/relationship/` — they
do not move there. Detail → [`organizations/README.md`](../src/features/content/organizations/README.md).

## Related docs

| Doc                                                  | Use for                                                   |
| ---------------------------------------------------- | --------------------------------------------------------- |
| [feature-conventions.md](./feature-conventions.md)   | Boundary rule, Storybook, page shells, catalog UI recipes |
| [form-lib-conventions.md](./form-lib-conventions.md) | Schema-driven form module splits and inventory            |
| [code-splitting.md](./code-splitting.md)             | Lazy routes, form-def deferral, bundle map                |
| [apps/dashboard/README.md](../README.md)             | App architecture, feature status table                    |
