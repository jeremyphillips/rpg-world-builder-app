# Campaign invites — Phase 0 architecture confirmation

Findings-only deliverable before feature implementation. Confirmed **2026-07-26**.

## Summary matrix

| #   | Area                                 | Status                                       | Decision                                                                                                            |
| --- | ------------------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1   | `specific_players` / no-PC viewer    | **CONFIRMED**                                | No contract change; `kind: 'none'` for accepted member with empty `controlledCharacterIds`                          |
| 2   | `CampaignBuildContext` union         | **CONFIRMED** feasible                       | Discriminated union on `characterKind` + `ownershipTarget` in Phase 1 contracts                                     |
| 3   | Builder finalize + assign            | **NEEDS-WORK**                               | Phase 6: `acquisition.kind === 'campaign_invite'` branch + orchestration                                            |
| 4   | Explicit `userId` in create          | **CONFIRMED** service / **NEEDS-WORK** route | `createCharacter(input, userId)` exists; HTTP always uses session user                                              |
| 5   | `assignControlledPcToCampaignMember` | **NEEDS-WORK**                               | No `ClientSession`; partial rollback (`$pull` control only)                                                         |
| 6   | Mongo topology                       | **CONFIRMED** standalone                     | Default `mongodb://127.0.0.1:27017/rpg`; memory-server in tests; no replica set                                     |
| 7   | `ClientSession` propagation          | **BLOCKER** for transactions                 | Zero session usage repo-wide; use compensating deletes (existing pattern)                                           |
| 8   | Auth `returnTo`                      | **NEEDS-WORK**                               | Phase 4: validated same-origin continuation on login/signup                                                         |
| 9   | Draft storage keys                   | **CONFIRMED**                                | `character-builder:{kind}:campaign:{campaignId}`; sessionStorage only                                               |
| 10  | Skills in discovery path             | **CONFIRMED** API / note builder gap         | API filters `skill-proficiencies` via `isContentDiscoverableForViewer`; builder has no second-pass on proficiencies |
| 11  | `findUserByEmail`                    | **NEEDS-WORK**                               | Phase 3: add thin wrapper (only `findUserByEmailWithSecret` exists today)                                           |
| 12  | User data access                     | **CONFIRMED**                                | Service + model pattern in `apps/api/src/features/user/`                                                            |

## 1. `specific_players` canonical path

- Zero occurrences of `specific_pcs` in the repo.
- Vocabulary: `all_players | dm_only | specific_players` in `packages/contracts/src/rpg/vocab/content-visibility.ts`.
- Enforcement: `isContentDiscoverableForViewer` in `packages/contracts/src/rpg/content/lib/content-viewer-access.ts`.
- `participantIds` stores PC character document ids (see `apps/api/docs/campaign-access-enforcement.md`).

**No-PC accepted member:** `buildContentViewerFromCampaignContext` returns `{ kind: 'none' }` when `campaignRole === 'pc'` and `pcCharacterIds.length === 0`. Such a viewer sees `all_players` content but not `dm_only` or `specific_players`. Correct for new-character builder onboarding.

**Existing-character eligibility:** use prospective viewer `{ kind: 'pc', characterIds: [candidateId] }` — not the member's empty viewer.

## 2. `CampaignBuildContext` widening

Current type (`packages/contracts/src/rpg/runtime/character-builder/context.ts`) hardcodes `characterKind: 'npc'` and `ownershipTarget: { type: 'campaign' }`.

`resolveBuilderLevelConstraints` already keys off `characterKind === 'pc' && rulesScope.type === 'campaign'` for fixed-level lock (`builder-level.ts`).

**Phase 1 action:** discriminated union — `campaign+npc` → `ownershipTarget: campaign`; `campaign+pc` → `ownershipTarget: user` with `userId`.

Dashboard consumers (`use-campaign-build-context.ts`, NPC routes) supply the NPC variant only; no production PC campaign route yet.

## 3. Builder acquisition / finalization

`character-builder-shell.client.tsx` `handleCreateCharacter` branches on `characterKind === 'npc'` vs PC standalone create. No `campaign_invite` path.

`apps/dashboard/docs/character-acquisition.md` documents PC↔campaign submission as not implemented.

**Phase 6 action:** switch on `acquisition.kind`; add `completeCampaignInviteWithNewCharacter` finalize branch.

## 4. Character creation — explicit `userId`

- `apps/api/src/features/character/character.service.ts`: `createCharacter(input, userId: string)`.
- `apps/api/src/features/character/character.repository.ts`: `createPcRecord(input, userId)`.
- Controller passes `req.user!.id` only.

Invite completion orchestration will call the service directly with the invite's accepted user id.

## 5. `assignControlledPcToCampaignMember`

File: `apps/api/src/features/campaign/participation/assign-controlled-pc.service.ts`.

- No optional `ClientSession` on any step.
- On failure after `attachCharacterToCampaign`: rolls back `$pull` from `controlledCharacterIds` only — does **not** undo participation attachment.

**Completion strategy:** compensating deletes mirroring `createCampaign` / `createCampaignNpc` unless session plumbing is added later.

## 6. Mongo transaction topology

- No Docker Compose replica-set config in repo.
- `docs/environment.md` / `apps/api/.env.example`: standalone Mongo on port 27017.
- `campaign.service.ts` documents compensating delete when owner membership creation fails.

**Decision:** MVP completion flows use compensating deletes, not multi-document transactions.

## 7. ClientSession propagation matrix

| Operation                | File                                             | Session support today           |
| ------------------------ | ------------------------------------------------ | ------------------------------- |
| PC creation              | `character.repository.ts`                        | No                              |
| Participation attach     | `campaign-character-participation.repository.ts` | No                              |
| Control assignment       | `assign-controlled-pc.service.ts`                | No                              |
| Membership update        | `campaign-membership` model direct calls         | No                              |
| Campaign create rollback | `campaign.service.ts`                            | Compensating delete, no session |

`assignControlledPcToCampaignMember` **cannot** safely join an outer transaction today without refactoring its internal compensation.

**Phase 3+ action:** thread optional `ClientSession` only if replica-set transactions are adopted; otherwise explicit compensation at orchestration layer.

## 8. Auth continuation

- `LoginForm` / `SignupForm`: optional `onSuccess`; default dashboard redirect.
- `AuthRedirect`: always sends authenticated users to dashboard.
- No `returnTo` query param exists.

**Phase 4 action:** validated same-origin `returnTo` with allowlisted prefixes; signup locks invited email.

## 9. Builder draft persistence

`getCharacterBuilderStorageKey` (`storage-key.ts`): `character-builder:{characterKind}:campaign:{campaignId}`.

Drafts live in Zustand + `sessionStorage` only. **Not** server-persisted. Resumable onboarding = invite record; draft recovery = existing per-context browser storage behavior.

## 10. Skills / proficiencies campaign access

- API `listContent` → `filterCatalogForMembership` → `isContentDiscoverableForViewer` applies to all content types including `skill-proficiencies`.
- Builder `resolveAvailableContent` filters species/classes/equipment/spells via `catalogViewer` but **not** skill proficiencies (picker reads catalog index directly).

**Eligibility resolver:** include skill/tool proficiency content ids in warning checks when present in `campaignContentById`; API catalog fetch already filters for builder pickers.

## 11–12. User lookup

- `findUserByEmail` does not exist.
- `findUserByEmailWithSecret` in `user.service.ts` — auth only.
- No repository layer; service calls `UserModel` directly.

**Phase 3 action:** add `findUserByEmail` returning `User` without password hash.

## Rollback strategy (locked for MVP)

Use compensating deletes for:

- New-character invite completion (delete orphan PC + undo control/participation on failure).
- Existing-character completion (`$pull` control; detach participation if attached in same orchestration).
- Campaign creation with invites (existing pattern — campaign survives SMTP failure).

Introduce `ClientSession` threading only if deployment topology gains replica-set transactions and the propagation matrix above is implemented.
