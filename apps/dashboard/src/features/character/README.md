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
| Restore affordance | `components/character-builder-draft-restore.client.tsx`                        |

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

| Subfolder           | Ownership                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------ |
| `builder/`          | Shell chrome, step navigation, rail, validation UX — see `character-builder-navigation.ts` |
| `builder-preview/`  | Builder/review projection (not sheet display)                                              |
| `campaign-context/` | Campaign build-context availability                                                        |
| `choice-sets/`      | Choice-set field wiring and selection helpers                                              |
| `detail/`           | Sheet catalog, tab filters, route error copy                                               |
| `display/`          | List/detail character display view models                                                  |
| `draft/`            | Draft merge, touch, and non-empty detection                                                |
| `equipment/`        | Equipment step view models                                                                 |
| `fixtures/`         | Story/test fixtures and builder context seeds                                              |
| `navigation/`       | Standalone sheet redirect helpers (not builder step rail)                                  |
| `proficiencies/`    | Proficiencies step view models                                                             |
| `spells/`           | Spells step view models                                                                    |
| `steps/`            | Identity and abilities builder form modules                                                |

Future folder triggers (not implemented until 3+ cohesive modules exist):

- Roster/list copy modules → `overview/` or `roster/`
- Multiple org-membership cache helpers → `memberships/` or `connections/`

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
