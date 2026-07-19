# Character acquisition

High-level model for how characters enter the system (build or import) and how
campaign scope relates to ownership. NPC dashboard UI is phased separately;
this doc captures contracts and API boundaries through Phase 2.

## Axes

| Axis              | Values                | Notes                                                                       |
| ----------------- | --------------------- | --------------------------------------------------------------------------- |
| `channel`         | `build`, `import`     | Initial acquisition path; import may later enter builder steps              |
| `characterKind`   | `pc`, `npc`           | What is being authored                                                      |
| `surface`         | `dashboard`, `public` | Where UI is hosted                                                          |
| `rulesScope`      | `ruleset`, `campaign` | Which rules/catalog apply                                                   |
| `ownershipTarget` | **derived**           | `user` for PC; `campaign` for NPC — use `resolveCharacterOwnershipTarget()` |

**Rules scope ≠ campaign membership.** Campaign rules during PC build/import do
not set `Character.campaignId`; approved submission does (future).

## Contracts layout

```
packages/contracts/src/rpg/runtime/character-acquisition/  # shared axes only
packages/contracts/src/rpg/runtime/character-builder/      # build context + engine
packages/contracts/src/rpg/runtime/character-import/     # import adapters (preview)
```

## API boundaries (Phase 2)

| Endpoint                                            | Purpose                  |
| --------------------------------------------------- | ------------------------ |
| `POST /api/characters`                              | User-owned PC create     |
| `GET/DELETE /api/characters/:id`                    | PC read/delete           |
| `GET/POST /api/campaigns/:campaignId/npcs`          | Campaign NPC list/create |
| `GET/DELETE /api/campaigns/:campaignId/npcs/:npcId` | NPC read/delete          |

NPC create body: `CreateNpcRequestInput` — no client `campaignId` or `characterType`.
PATCH edit is **out of scope** for NPC v1.

## Import adapter reuse (required)

NPC import (when implemented) must call `adaptDndBeyondCharacter()` and shared
name indexes — no parallel D&D Beyond mapping. Import finalization ships for PC
first (`finalizeCharacterImport`), then NPC.
