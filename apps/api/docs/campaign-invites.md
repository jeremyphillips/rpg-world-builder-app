# Campaign invites

Architecture and behavior for the campaign invite and character-onboarding flow.
Historical phase-0 findings: [campaign-invites-phase-0.md](./campaign-invites-phase-0.md).

## Overview

Invites let campaign owners (`owner` / `co-owner`) email a player, who accepts
via the public app, then completes character onboarding in the dashboard. The
flow reuses existing membership, participation, and control primitives — no
parallel invite-specific character association.

| App       | Responsibility                                                        |
| --------- | --------------------------------------------------------------------- |
| Public    | `/campaign-invites/[token]` — resolve, auth continuation, accept      |
| Dashboard | `/campaigns/:id/onboarding?inviteId=…` — character choice and builder |
| API       | Invite state machine, email delivery, onboarding-context, completion  |

The raw invite token never crosses into the dashboard. Only the invite `id` is
passed as `inviteId`; the onboarding-context endpoint re-validates ownership,
status, and membership server-side.

## State machine

Invite `status` values: `pending` → `accepted` → `completed`, with `expired` and
`revoked` as terminal states.

| Status      | Meaning                                                           |
| ----------- | ----------------------------------------------------------------- |
| `pending`   | Sent, awaiting acceptance                                         |
| `accepted`  | Player joined (`joinedAt` set); character onboarding not finished |
| `completed` | `completedCharacterId` set; onboarding finished                   |
| `expired`   | Past `expiresAt`; lazy transition on resolve/read (no cron)       |
| `revoked`   | Cancelled by an owner/co-owner; token invalidated immediately     |

Rules:

- `CAMPAIGN_INVITE_EXPIRY_DAYS = 7` — computed at create/rotate; **not** extended
  on acceptance. An accepted invite past `expiresAt` transitions to `expired` on
  next read and blocks further completion.
- Membership survives invite expiration and revocation. An expired- or
  revoked-while-accepted member keeps `pc` role and empty `controlledCharacterIds`.
  The owner can send a **new pending invite** to the same email (incomplete-member
  recovery).
- Token rotation is restricted to `pending` invites. Rotating invalidates the
  previous token immediately (lookup is by current `tokenHash` only).
- **Share new invite link** (`POST …/invites/:inviteId/share-link`) rotates the
  token for a pending invite, resends email, and returns `{ inviteUrl }` for
  clipboard copy. Subject to the same 60-second cooldown as resend.
- **Revoke** (`POST …/invites/:inviteId/revoke`) is allowed for `pending` and
  `accepted` invites. Membership is retained for accepted revokes; onboarding is
  blocked. Completed, expired, and revoked invites cannot be revoked again.
- Sending while an active `accepted` invite exists returns `invite_already_accepted`.
- `already_member` applies only when `controlledCharacterIds.length > 0`.

## Token security

- Generate: `randomBytes(32)` hex (in memory only).
- Persist: SHA-256 hash in `tokenHash` — never store or log the raw token.
- Lookup: resolve/accept endpoints compare by hash only.
- API responses use `CampaignInviteAdminListItem` and public DTOs that omit
  `tokenHash` and raw tokens.

## Send semantics (`sendCampaignInvite`)

Single orchestration entry point with explicit branches:

1. **Create** — no active invite for `(campaignId, normalizedEmail)`.
2. **Rotate** — active `pending` invite; enforces 60-second cooldown per row.
3. **Reject** — active `accepted` invite that has not expired.
4. **Recovery** — expired `accepted` invite for incomplete member allows a new
   `pending` invite.

Email delivery failures never roll back the persisted invite. `deliveryStatus`
reflects the outcome (`sent` / `failed`).

Campaign creation accepts optional `inviteEmails` and uses the same send path;
SMTP failure never rolls back the campaign.

## Acceptance

`acceptCampaignInvite` requires the authenticated user's email to match the
invite (server-side; never trust client-supplied email).

- Idempotent: re-accept by the same user is a no-op success.
- Different user on an already-accepted invite is a domain error.
- Creates or confirms `pc` membership via `createOrConfirmPlayerMembership`
  with empty `controlledCharacterIds` and sets `joinedAt`.

## Onboarding completion

Two public service entry points delegate to a shared orchestrator
(`completeCampaignInviteWithCharacter`) that resolves cheap invite context first,
then source-specific candidates, then expensive eligibility context, before
source-specific write adapters. Both paths call `assignControlledPcToCampaignMember`
at the write core (`executeInviteCompletionWrites`).

| Path               | Service entry                                 | Acquisition discriminator |
| ------------------ | --------------------------------------------- | ------------------------- |
| Existing PC        | `completeCampaignInviteWithExistingCharacter` | N/A (direct assignment)   |
| New PC via builder | `completeCampaignInviteWithNewCharacter`      | `campaign_invite`         |

Idempotency via `completedCharacterId`:

- Re-completion with the **same** `characterId` → no-op success.
- Re-completion with a **different** `characterId` → conflict.

Eligibility uses `CampaignContentEligibilityIndex` (content by id, skill/tool
slugs, ruleset languages, species heritage options). Missing referenced content
surfaces as a blocking `content_missing` issue instead of being silently skipped.

Mongo transactions are used when `MONGO_TRANSACTION_MODE` resolves to enabled
at startup (replica-set topology). Otherwise failures after partial writes use
compensating deletes/`$pull` mirroring `createCampaign` and `createCampaignNpc`.
For existing-character completion, rollback must target only the participation
created in that attempt — not `deleteAllParticipationsForCharacter` (use
`detachOpenParticipation`).

## Derived onboarding state (overview)

Do **not** persist onboarding state on membership. Derive it at read time:

```ts
// pc role only
controlledCharacterIds.length > 0 ? 'character_added' : 'onboarding_incomplete'
```

Implemented in `campaign-overview.service.ts` (`resolveMemberOnboardingState`).
Party list includes only PCs with open participation **and** a controlling
member (`controlledCharacterIds`).

Overview display rules:

- Invitations list shows **pending** invites only.
- Failed delivery copy: `Email not sent · Expires <date>` (no “Sent …” line).
- Successful delivery includes `sentAt` for “Sent …” copy.
- Members with incomplete onboarding may include `inviteAcceptedAt` (from
  membership `joinedAt`).
- Revoked, expired, and completed invites are hidden from the default overview.

## API surface

| Method | Path                                                               | Auth                  |
| ------ | ------------------------------------------------------------------ | --------------------- |
| POST   | `/api/campaigns/:campaignId/invites`                               | owner/co-owner        |
| GET    | `/api/campaigns/:campaignId/invites`                               | owner/co-owner        |
| POST   | `/api/campaigns/:campaignId/invites/:inviteId/share-link`          | owner/co-owner        |
| POST   | `/api/campaigns/:campaignId/invites/:inviteId/revoke`              | owner/co-owner        |
| GET    | `/api/campaign-invites/:token`                                     | public                |
| POST   | `/api/campaign-invites/:token/accept`                              | authenticated invitee |
| GET    | `/api/campaign-invites/:inviteId/onboarding-context`               | authenticated invitee |
| GET    | `/api/campaign-invites/:inviteId/eligible-characters`              | authenticated invitee |
| POST   | `/api/campaign-invites/:inviteId/complete-with-existing-character` | authenticated invitee |
| POST   | `/api/campaign-invites/:inviteId/complete-with-new-character`      | authenticated invitee |

## Indexes

`CampaignInvite` model indexes (verified in `campaign-invite.model.test.ts`):

- `{ tokenHash: 1 }` — unique
- `{ campaignId: 1, normalizedEmail: 1 }` — unique partial on
  `status ∈ { pending, accepted }`

## Email

Invite email goes through `email.service.ts` with swappable providers
(`fake` / `ethereal` / `smtp`). Env vars: see `docs/environment.md` and
`apps/api/.env.example` (`EMAIL_PROVIDER`, `APP_BASE_URL`, `SMTP_*`).

With `EMAIL_PROVIDER=ethereal` (the default in development), each successful
send logs an Ethereal preview URL to the API terminal:
`[email] Ethereal preview: <url>`. Open that link to read the invite email in
the browser — no inbox or SMTP credentials required.

## Related docs

- [campaign-access-enforcement.md](./campaign-access-enforcement.md) — viewer
  identity and `specific_players` for members with no controlled PC yet
- [character-acquisition.md](../../dashboard/docs/character-acquisition.md) —
  dashboard entry surfaces including invite onboarding
- [packages/contracts/ROLES.md](../../../packages/contracts/ROLES.md) — role
  timing and content visibility vocabulary
