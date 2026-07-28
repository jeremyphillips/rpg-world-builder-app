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

Root `lib/` keeps feature-wide fixtures only (`character-builder-fixtures.ts`,
`character-fixtures.ts`, `campaign-roster-presentation.ts`). Step form modules stay
in `lib/steps/`; sheet filters stay in `lib/detail/`.

| Subfolder           | Ownership                                     |
| ------------------- | --------------------------------------------- |
| `builder/`          | Shell chrome, navigation, rail, validation UX |
| `builder-preview/`  | Builder/review projection (not sheet display) |
| `campaign-context/` | Campaign build-context availability           |
| `choice-sets/`      | Choice-set field wiring and selection helpers |
| `draft/`            | Draft merge, touch, and non-empty detection   |
| `display/`          | List/detail character display view models     |
| `equipment/`        | Equipment step view models                    |
| `proficiencies/`    | Proficiencies step view models                |
| `spells/`           | Spells step view models                       |

Co-located `components/**/*.lib.ts` modules stay beside their UI when they are
drawer/inventory view models or picker chrome — see
[feature-structure.md § Character builder co-location](../../docs/feature-structure.md#character-builder-co-located-lib-modules).

## Related docs

- [character-builder.md](../../docs/character-builder.md) — dashboard builder integration (readiness, rail)
- [feature-structure.md](../../docs/feature-structure.md)
- [routing.md](../../../../docs/routing.md)
