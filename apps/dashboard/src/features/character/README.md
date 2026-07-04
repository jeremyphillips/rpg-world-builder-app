# character (dashboard feature)

Player character roster and sheets. The list route is user-scoped (not under
`:campaignId`); campaign association lives on the character record, not in the
URL.

Folder layout and the feature-boundary rule are documented in
[feature-conventions](../../../docs/feature-conventions.md).

## Key files

| Area               | Path                                                       |
| ------------------ | ---------------------------------------------------------- |
| List route         | `routes/characters-overview.tsx`                           |
| Create route       | `routes/character-create.tsx` (concentration mode)         |
| Detail route       | `routes/character-detail.tsx`                              |
| API clients        | `api/character-client.ts`, `api/ruleset-content-client.ts` |
| Build context      | `hooks/use-build-context.ts`                               |
| Draft store        | `store/character-builder-store.ts`                         |
| Restore affordance | `components/character-builder-draft-restore.client.tsx`    |
| Builder shell      | `components/character-builder-shell.client.tsx`            |
| Step rail          | `components/character-builder-step-rail.client.tsx`        |
| Preview panel      | `components/character-builder-preview-panel.client.tsx`    |
| Preview hook       | `hooks/use-character-preview.ts`                           |

## Routes

| Path                       | Screen                                   |
| -------------------------- | ---------------------------------------- |
| `/characters`              | My characters list                       |
| `/characters/new`          | Character builder (`ConcentrationShell`) |
| `/characters/:characterId` | Character detail                         |

## Related docs

- [feature-structure.md](../../docs/feature-structure.md)
- [routing.md](../../../../docs/routing.md)
