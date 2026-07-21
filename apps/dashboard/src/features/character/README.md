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
| Detail content     | `components/detail/character-detail-content.client.tsx`    |
| API clients        | `api/character-client.ts`, `api/ruleset-content-client.ts` |
| Build context      | `hooks/use-build-context.ts`                               |
| Character queries  | `hooks/use-character.ts`, `hooks/use-characters.ts`        |
| Create mutation    | `hooks/use-create-character.ts`                            |
| Draft store        | `store/character-builder-store.ts`                         |
| Restore affordance | `components/character-builder-draft-restore.client.tsx`    |
| Builder shell      | `components/character-builder-shell.client.tsx`            |
| Step rail          | `components/character-builder-step-rail.client.tsx`        |
| Preview panel      | `components/character-builder-preview-panel.client.tsx`    |
| Preview hook       | `hooks/use-character-preview.ts`                           |
| Step panel (stub)  | `components/character-builder-step-panel.client.tsx`       |
| Step frame         | `components/steps/builder-step-frame.client.tsx`           |
| Readiness panel    | `components/steps/builder-step-readiness-panel.client.tsx` |
| Validation alert   | `components/character-builder-validation-alert.client.tsx` |
| Footer             | `components/character-builder-footer.client.tsx`           |

## Routes

| Path                       | Screen                                                     |
| -------------------------- | ---------------------------------------------------------- |
| `/characters`              | My characters list                                         |
| `/characters/new`          | Character builder (concentration mode, outside `AppShell`) |
| `/characters/:characterId` | Character detail                                           |

## Related docs

- [character-builder.md](../../docs/character-builder.md) — dashboard builder integration (readiness, rail)
- [feature-structure.md](../../docs/feature-structure.md)
- [routing.md](../../../../docs/routing.md)
