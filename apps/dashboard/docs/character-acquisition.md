# Character acquisition

High-level model for how characters enter the system (build or import) and how
campaign scope relates to ownership. Covers contracts, API boundaries, and
dashboard entry surfaces through NPC import (phase 6).

## Axes

| Axis              | Values                | Notes                                                                       |
| ----------------- | --------------------- | --------------------------------------------------------------------------- |
| `channel`         | `build`, `import`     | Initial acquisition path; import may later enter builder steps              |
| `characterKind`   | `pc`, `npc`           | What is being authored                                                      |
| `surface`         | `dashboard`, `public` | Where UI is hosted                                                          |
| `rulesScope`      | `ruleset`, `campaign` | Which rules/catalog apply                                                   |
| `ownershipTarget` | **derived**           | `user` for PC; `campaign` for NPC — use `resolveCharacterOwnershipTarget()` |

**Rules scope ≠ campaign membership.** Campaign rules during PC build/import do
not set `Character.campaignId`. PC campaign association requires an approved
submission workflow (**not implemented** — see [ROLES.md](../../../packages/contracts/ROLES.md)).

## Contracts layout

```
packages/contracts/src/rpg/runtime/character-acquisition/  # shared axes only
packages/contracts/src/rpg/runtime/character-builder/      # build context + engine
packages/contracts/src/character-import/                   # adapt + finalize import
```

## Dashboard entry surfaces

| Entry             | URL                          | channel | kind | rulesScope | ownership |
| ----------------- | ---------------------------- | ------- | ---- | ---------- | --------- |
| Sidebar PC build  | `/characters/new`            | build   | pc   | ruleset    | user      |
| Sidebar PC import | `/characters/import`         | import  | pc   | ruleset    | user      |
| NPC build         | `/campaigns/:id/npcs/new`    | build   | npc  | campaign   | campaign  |
| NPC import        | `/campaigns/:id/npcs/import` | import  | npc  | campaign   | campaign  |
| PC detail         | `/characters/:characterId`   | —       | pc   | —          | user      |
| NPC detail        | `/campaigns/:id/npcs/:npcId` | —       | npc  | —          | campaign  |

NPC authoring routes require campaign `owner` or `co-owner` (see campaign feature
README). Default `/characters/*` never carries campaign id in the URL.

## API boundaries

| Endpoint                                            | Purpose                  |
| --------------------------------------------------- | ------------------------ |
| `POST /api/characters`                              | User-owned PC create     |
| `GET/DELETE /api/characters/:id`                    | PC read/delete           |
| `GET/POST /api/campaigns/:campaignId/npcs`          | Campaign NPC list/create |
| `GET/DELETE /api/campaigns/:campaignId/npcs/:npcId` | NPC read/delete          |

NPC create body: `CreateNpcRequestInput` — no client `campaignId` or `characterType`
(route assigns both). PATCH edit is **out of scope** for NPC v1.

## Build finalization

| Function                      | Purpose                                                           |
| ----------------------------- | ----------------------------------------------------------------- |
| `finalizeCharacterBuild()`    | Builder draft → `CreateCharacterInput` (PC)                       |
| `finalizeNpcCharacterBuild()` | Builder draft → `CreateNpcRequestInput` (strips ownership fields) |

## Import finalization

| Function                       | Purpose                                                          |
| ------------------------------ | ---------------------------------------------------------------- |
| `finalizeCharacterImport()`    | `CharacterImportResult` → `CreateCharacterInput`                 |
| `finalizeNpcCharacterImport()` | Thin wrapper → `CreateNpcRequestInput` (strips ownership fields) |

Shared assembly lives in `assembleImportCreateCharacterInput()`. Adaptation stays in
`adaptDndBeyondCharacter()` — finalizers only map extracted preview fields.

## Detail sheet (shared PC/NPC UI)

PC and NPC detail routes both build a `CharacterDetailViewModel` and render
[`CharacterDetailContent`](../src/features/character/components/detail/character-detail-content.client.tsx).
Keep sheet layout kind-neutral there; route wrappers own kind-specific loading and
mutations. See the growth comment on `CharacterDetailContent` for the PC/NPC
boundary (hide user-ownership affordances on NPC surfaces).
