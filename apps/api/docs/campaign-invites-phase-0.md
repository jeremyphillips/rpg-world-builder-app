# Campaign invites — Phase 0 architecture confirmation

Historical findings deliverable from before feature implementation. Confirmed **2026-07-26**.
**Live reference:** [campaign-invites.md](./campaign-invites.md).

> Phase 0 items marked **IMPLEMENTED** below shipped in phases 1–9. **DEFERRED**
> items remain follow-up work — see the plan's ClientSession propagation follow-up.

## Summary matrix

| #   | Area                                 | Status          | Decision                                                                                             |
| --- | ------------------------------------ | --------------- | ---------------------------------------------------------------------------------------------------- |
| 1   | `specific_players` / no-PC viewer    | **CONFIRMED**   | No contract change; `kind: 'none'` for accepted member with empty `controlledCharacterIds`           |
| 2   | `CampaignBuildContext` union         | **IMPLEMENTED** | Discriminated union on `characterKind` + `ownershipTarget` (Phase 1)                                 |
| 3   | Builder finalize + assign            | **IMPLEMENTED** | `acquisition.kind === 'campaign_invite'` branch + `completeCampaignInviteWithNewCharacter` (Phase 6) |
| 4   | Explicit `userId` in create          | **IMPLEMENTED** | Invite completion calls `createPcRecord(input, userId)` directly; HTTP routes use session user       |
| 5   | `assignControlledPcToCampaignMember` | **DEFERRED**    | No `ClientSession`; partial rollback (`$pull` control only) — see follow-up below                    |
| 6   | Mongo topology                       | **CONFIRMED**   | Standalone Mongo in dev; compensating deletes for MVP completion flows                               |
| 7   | `ClientSession` propagation          | **DEFERRED**    | Zero session usage repo-wide today; follow-up when replica-set transactions are adopted              |
| 8   | Auth `returnTo`                      | **IMPLEMENTED** | Validated same-origin continuation on login/signup (Phase 4)                                         |
| 9   | Draft storage keys                   | **CONFIRMED**   | `character-builder:{kind}:campaign:{campaignId}`; sessionStorage only                                |
| 10  | Skills in discovery path             | **CONFIRMED**   | API filters `skill-proficiencies`; eligibility warnings cover proficiency gaps in invite combobox    |
| 11  | `findUserByEmail`                    | **IMPLEMENTED** | Thin wrapper in `user.service.ts` (Phase 3)                                                          |
| 12  | User data access                     | **CONFIRMED**   | Service + model pattern in `apps/api/src/features/user/`                                             |

## Rollback strategy (locked for MVP — still current)

Use compensating deletes for:

- New-character invite completion (delete orphan PC + undo control/participation on failure).
- Existing-character completion (`$pull` control; detach participation if attached in same orchestration).
- Campaign creation with invites (campaign survives SMTP failure).

Introduce `ClientSession` threading only when deployment topology gains replica-set
transactions and the propagation matrix in [campaign-invites.md](./campaign-invites.md)
/ plan follow-up §19 is implemented. Initial invite-repo scope is
`markInviteCompleted` only; acceptance and rotation stay on compensation until
their orchestrations adopt transactions.
