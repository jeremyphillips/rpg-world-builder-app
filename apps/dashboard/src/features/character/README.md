# character (dashboard feature)

Player character roster and sheets. The list route is user-scoped (not under
`:campaignId`); campaign association lives on the character record, not in the
URL.

Folder layout and the feature-boundary rule are documented in
[feature-conventions](../../../docs/feature-conventions.md).

## Key files

| Area               | Path                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| List route         | `routes/characters-overview.tsx`                                               |
| Create route       | `routes/character-create.tsx` (concentration mode)                             |
| Detail route       | `routes/character-detail.tsx`                                                  |
| Detail content     | `components/detail/character-detail-content.client.tsx`                        |
| Detail lib         | `lib/detail/` — sheet catalog cards, tab filters, route error copy             |
| API clients        | `api/character-client.ts`, `api/ruleset-content-client.ts`                     |
| Build context      | `hooks/use-build-context.ts`                                                   |
| Character queries  | `hooks/use-character.ts`, `hooks/use-characters.ts`                            |
| Create mutation    | `hooks/use-create-character.ts`                                                |
| Draft store        | `store/character-builder-store.ts`                                             |
| Draft merge/touch  | `lib/draft/`                                                                   |
| Builder shell      | `lib/builder/` — navigation, validation UX, finalize                           |
| Builder preview    | `lib/builder-preview/` — review/right-panel projection                         |
| Step view models   | `lib/equipment/`, `lib/spells/`, `lib/proficiencies/`                          |
| Choice-set wiring  | `lib/choice-sets/`                                                             |
| Character display  | `lib/display/` — list/detail view models                                       |
| Step hooks         | `hooks/use-equipment-step.client.ts`, `hooks/use-proficiencies-step.client.ts` |
| Restore affordance | `components/builder/chrome/character-builder-draft-restore.client.tsx`         |

## `components/detail/` layout

Read-only character sheet UI shared by PC and NPC detail routes. Route entry
points stay at the folder root; subfolders group stable sub-surfaces. Non-UI
catalog/filter logic lives in `lib/detail/`; view models in `lib/display/`.

| Subfolder      | Responsibility                                                        |
| -------------- | --------------------------------------------------------------------- |
| _(root)_       | `character-detail-content`, `character-sheet-detail-shell`            |
| `sheet/`       | Upper sheet layout — header, ability/stat/combat rows, stat tile, CVA |
| `tabs/`        | Lower tab region — spells/equipment catalog tabs, narrative           |
| `status/`      | Route-injected status chrome (`statusSummary` slot)                   |
| `memberships/` | Campaign org membership summary, container, drawer wiring             |

Builder `equipment/`, `spells/`, and `connections/` folders are separate
lifecycles — detail tabs and membership composition stay here.

## `components/equipment/` layout

Builder equipment acquisition UI — catalog drawer, step inventory, acquisition
panel, starting package, and package-switch modal. Shared catalog chrome lives in
`components/picker/` (not here).

| Subfolder           | Responsibility                                                                    |
| ------------------- | --------------------------------------------------------------------------------- |
| `picker/drawer/`    | Equipment picker shell, types, fixtures                                           |
| `picker/browse/`    | Filters, budget header, catalog result rows                                       |
| `picker/details/`   | Item detail panel + character preview                                             |
| `picker/purchase/`  | Picker purchase/grant UI (not step-level acquisition)                             |
| `picker/callouts/`  | Picker callout logic + presentation                                               |
| `inventory/`        | Step inventory — `summary/`, `row/`, `column/`, `purchased/`, `added/`, `manage/` |
| `acquisition/`      | Step acquisition panel, guidance, commit labels                                   |
| `starting-package/` | Starting-equipment option cards, package card, toolbar                            |
| `package-switch/`   | Package-switch resolution modal and conversion editor                             |

Inventory layout VM: `lib/equipment/equipment-inventory-summary.lib.ts`. Shared
inventory CVA: `inventory/equipment-inventory.variants.ts`.

## `components/connections/` layout

Reusable organization membership UI — picker drawer, edit drawer, and shared title
field. Builder step composition lives in `components/builder/steps/connections/`;
sheet summary and drawer wiring live in `components/detail/memberships/`.

| Subfolder / file                                 | Responsibility                          |
| ------------------------------------------------ | --------------------------------------- |
| `picker/organization-picker-drawer.*`            | Add-membership catalog picker sheet     |
| `edit-organization-membership-drawer.*`          | Edit/remove membership drawer + copy    |
| `organization-membership-title-field.client.tsx` | Shared title radio field (presentation) |

Membership title semantics (sentinel constant, radio mappers) live in
`lib/organization-membership/organization-membership-title.lib.ts`.

## `components/builder/` layout

Builder-only presentation and composition. Reusable character-domain UI stays in
sibling folders (`equipment/`, `spells/`, `proficiencies/`, `connections/`,
`picker/`).

> If a component exists because `CharacterBuilder` exists, it belongs under
> `components/builder/`. If a component is reusable outside the builder, keep it
> under its domain folder. Builder steps may import domain UI; domain UI must not
> depend on builder step implementation.

| Subfolder    | Responsibility                                                                    |
| ------------ | --------------------------------------------------------------------------------- |
| _(root)_     | Shell orchestration — `character-builder-shell`, step router, form↔footer glue    |
| `chrome/`    | Persistent builder chrome — rail, panel frame, footer, validation, level, restore |
| `preview/`   | Live preview sidebar — panel, accordion, section content                          |
| `fields/`    | Builder choice rendering — `ChoiceSetField`, dependent choice sections            |
| `inventory/` | Builder row remove affordance (reused by steps and domain pickers)                |
| `steps/`     | One folder per canonical step; shared chrome in `steps/shared/`                   |

Each builder step owns a folder (`identity/`, `species/`, `class/`, `abilities/`,
`proficiencies/`, `equipment/`, `spells/`, `connections/`, `review/`). Shared step wrappers
(`builder-step-frame`, `builder-step-readiness-panel`) live in `steps/shared/`. Subdivide within a
step only for stable sub-responsibilities (e.g. `abilities/assignment/`, `abilities/recommendation/`).

Step orchestration hooks stay in `hooks/` (`use-*-step.client.ts`); view models
stay in `lib/builder/`, `lib/steps/`, and per-concern `lib/<step>/`.

## `npc/` sub-feature

Campaign-scoped NPC roster, Quick NPC nested create, bulk roster status, and thin
routes that delegate full builder/detail to parent `character/` surfaces.

| Area                  | Path                                                          |
| --------------------- | ------------------------------------------------------------- |
| Overview route        | `npc/routes/npcs-overview.tsx`                                |
| Detail route          | `npc/routes/npc-detail.tsx` (reuses `CharacterDetailContent`) |
| Create route          | `npc/routes/npc-create.tsx` (reuses `CharacterBuilderShell`)  |
| Quick NPC modal       | `npc/components/quick-npc/`                                   |
| Quick NPC lib         | `npc/lib/quick-npc/`                                          |
| Bulk roster status    | `npc/lib/bulk/`                                               |
| Overview table config | `npc/lib/npc-overview-*`, `npcs-overview-columns.tsx`         |
| Imperative NPC fetch  | `npc/lib/fetch-campaign-npcs.lib.ts`                          |

### Cross-feature barrel exports

Other features import NPC capabilities through `@/features/character` only — not
`npc/` internals.

| Export                         | Use                                                              |
| ------------------------------ | ---------------------------------------------------------------- |
| `fetchCampaignNpcs`            | Imperative campaign NPC list with canonical query/cache behavior |
| `invalidateCampaignNpcQueries` | Invalidate NPC list cache after nested create                    |
| `useNpcs`, `npcsQueryKey`      | React query hook for campaign NPC list                           |
| Quick NPC modal exports        | Nested create from relationship pickers                          |

`npc/api/` (`listNpcs`, `getNpc`, …) and single-NPC query keys remain internal
until an external consumer requires them.

**Follow-up:** audit cross-feature imperative catalog fetching for locations and
organizations (`listLocations`, `listOrganizations` deep imports in relationship
picker) and establish matching capability exports where production consumers exist.

## Routes

| Path                       | Screen                                                     |
| -------------------------- | ---------------------------------------------------------- |
| `/characters`              | My characters list                                         |
| `/characters/new`          | Character builder (concentration mode, outside `AppShell`) |
| `/characters/:characterId` | Character detail                                           |

## `store/`

Zustand draft state plus sessionStorage hydration boundary. The store module
(`store/character-builder-store.ts`) owns persistence keys, merge-on-restore, and
the in-memory draft snapshot; React wiring lives in `hooks/use-character-builder-store.ts`.

## `lib/` layout

Root policy: `lib/` may contain a small number of cross-cutting Character seams
that do not yet form a material subdomain. Stable multi-file concerns belong in
subdirectories.

| Root file                                                 | Role                                                      |
| --------------------------------------------------------- | --------------------------------------------------------- |
| `characters-overview-copy.ts`                             | Standalone list section labels and empty-state copy       |
| `campaign-roster-presentation.ts`                         | Roster status badge presentation (list card, NPC columns) |
| `invalidate-character-organization-membership-queries.ts` | Org membership query invalidation                         |

| Subfolder                  | Ownership                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| `builder/`                 | Shell chrome, step navigation, rail, validation UX — see `character-builder-navigation.ts` |
| `builder-preview/`         | Builder/review projection (not sheet display)                                              |
| `campaign-context/`        | Campaign build-context availability                                                        |
| `choice-sets/`             | Choice-set field wiring and selection helpers                                              |
| `detail/`                  | Sheet catalog, tab filters, route error copy                                               |
| `display/`                 | List/detail character display view models                                                  |
| `draft/`                   | Draft merge, touch, and non-empty detection                                                |
| `equipment/`               | Equipment step view models                                                                 |
| `fixtures/`                | Story/test fixtures and builder context seeds                                              |
| `navigation/`              | Standalone sheet redirect helpers (not builder step rail)                                  |
| `proficiencies/`           | Proficiencies step view models                                                             |
| `organization-membership/` | Title sentinel + radio mapping for org membership connections                              |
| `spells/`                  | Spells step view models                                                                    |
| `steps/`                   | Identity and abilities builder form modules                                                |

Future folder triggers (not implemented until 3+ cohesive modules exist):

- Roster/list copy modules → `overview/` or `roster/`

Co-located `components/**/*.lib.ts` modules stay beside their UI when they are
drawer/inventory view models or picker chrome — see
[feature-structure.md § Character builder co-location](../../docs/feature-structure.md#character-builder-co-located-lib-modules).

Shared TanStack Query slice helpers for route shells live in
[`@/lib/query/query-state.lib`](../../lib/query/query-state.lib.ts), not under
this feature.

## Related docs

- [character-builder.md](../../docs/character-builder.md) — dashboard builder integration (readiness, rail)
- [feature-structure.md](../../docs/feature-structure.md)
- [routing.md](../../../../docs/routing.md)
