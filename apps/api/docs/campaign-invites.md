# Campaign invites

Architecture and behavior for the campaign invite and character-onboarding flow.
Historical phase-0 findings: [campaign-invites-phase-0.md](./campaign-invites-phase-0.md).

## Overview

Invites let campaign owners (`owner` / `co-owner`) email a player, who accepts
via the public app, then completes character onboarding in the dashboard. The
flow reuses existing membership, participation, and control primitives — no
parallel invite-specific character association.

| App       | Responsibility                                                                                              |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| Public    | `/campaign-invites/[token]` — token resolve, auth continuation, accept                                      |
| Dashboard | `/app/campaign-invites/:inviteId` — notification/card review; `/campaigns/:id/onboarding` — character setup |
| API       | Invite lifecycle + membership-scoped onboarding completion                                                  |

After accept, the public app redirects to dashboard onboarding. The raw invite
token never crosses into the dashboard. The dashboard does **not** pass
`inviteId` in the URL — membership-scoped onboarding endpoints gate access from
campaign participation state.

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
  next read.
- **Membership-scoped completion** (`/api/campaigns/:campaignId/onboarding/complete`)
  is the only completion path. It allows recoverable onboarding even when the
  linked invite is `expired` — membership is authoritative; invite
  terminalization is audit-only (see below).
- Membership survives invite expiration. An expired accepted invite allows a new
  pending invite for incomplete-member recovery. Managers can also remove an
  accepted incomplete PC via `DELETE …/members/:membershipId`, which deletes
  membership and revokes linked accepted invites so the email can be invited again.
- Token rotation is restricted to `pending` invites. Rotating invalidates the
  previous token immediately (lookup is by current `tokenHash` only).
- **Share new invite link** (`POST …/invites/:inviteId/share-link`) rotates the
  token for a pending invite, resends email, and returns `{ inviteUrl }` for
  clipboard copy. Subject to the same 60-second cooldown as resend.
- **Revoke** (`POST …/invites/:inviteId/revoke`) is allowed for `pending` invites only.
  Accepted invites cannot be revoked; managers remove incomplete members instead
  (`DELETE …/members/:membershipId`). Completed, expired, and revoked invites
  cannot be revoked again.
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
  with empty `controlledCharacterIds`, sets `joinedAt`, and records
  `sourceInviteId` (the accepted invite). Re-accept on recovery updates
  `sourceInviteId` to the newly accepted invite.

### Review surfaces

| Entry                         | Route                             | App       | Auth                     |
| ----------------------------- | --------------------------------- | --------- | ------------------------ |
| Email token                   | `/campaign-invites/:token`        | Public    | Continuation when needed |
| Notification / dashboard card | `/app/campaign-invites/:inviteId` | Dashboard | Session gate             |

The public route accepts **64-char invite tokens only**
(`parseCampaignInviteTokenSegment` in `@rpg/contracts`). Invalid segments render
unavailable UI without an API call.

| Segment   | Resolve                                     | Accept                          | Email mismatch                                        |
| --------- | ------------------------------------------- | ------------------------------- | ----------------------------------------------------- |
| Token     | `GET /api/campaign-invites/:token`          | `POST …/accept`                 | 403 on accept; masked-email sign-in prompt on resolve |
| Invite id | `GET /api/campaign-invites/by-id/:inviteId` | `POST …/by-id/:inviteId/accept` | **404** on resolve/accept (anti-probing)              |

Both review flows use the same explicit UX via `@rpg/campaign-invite` — no
auto-accept on mount:

- **Pending** → review context + **Accept invitation**
- **Accepted** (same user) → **Continue to character setup** (onboarding)
- **Completed** → **Open campaign** (`crossAppCampaignDetailPath`)
- **Revoked / expired** → unavailable copy

Notification clicks navigate to the dashboard invite-id review route
(`dashboardCampaignInviteReviewPath`); membership changes happen on the explicit
accept button.

## Onboarding completion

### Canonical path (membership-scoped)

The dashboard uses campaign-scoped endpoints. `completeCampaignOnboarding` resolves
membership context, links an accepted invite for audit, and delegates to
`completeCampaignCharacterAssignment` in
`campaign/participation/character-assignment/`.

| Step         | Service / route                                                 |
| ------------ | --------------------------------------------------------------- |
| Context      | `GET /api/campaigns/:campaignId/onboarding-context`             |
| Eligible PCs | `GET /api/campaigns/:campaignId/onboarding/eligible-characters` |
| Complete     | `POST /api/campaigns/:campaignId/onboarding/complete`           |

| Source             | Body shape                            | Acquisition discriminator (new only) |
| ------------------ | ------------------------------------- | ------------------------------------ |
| Existing PC        | `{ source: 'existing', characterId }` | N/A                                  |
| New PC via builder | `{ source: 'new', character }`        | `campaign_pc_onboarding`             |

**Linked invite selection** when multiple accepted invites exist:

1. Prefer `CampaignMembership.sourceInviteId` when that invite belongs to the user.
2. Otherwise select the newest `accepted` invite and log
   `[campaign-onboarding-duplicate-accepted-invites]` (production observability).

**Invite audit (membership-scoped only):** after `assignControlledPcToCampaignMember`
succeeds, the service attempts `markInviteCompleted` on the linked invite. Failure
does **not** roll back membership completion. Emit
`[campaign-onboarding-invite-audit-failed]` for operations visibility.

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

### Completion error wire format

Completion failures use stable code `campaign_invite_completion_failed` with
structured `error.details`:

| `details.kind`        | HTTP            | Payload                                         |
| --------------------- | --------------- | ----------------------------------------------- |
| `build_invalid`       | 400             | `{ issues }` — builder-shaped validation issues |
| `campaign_ineligible` | 422             | `{ blockingIssues, warnings }`                  |
| `invite_unavailable`  | 403 / 409 / 410 | `{ reason }`                                    |

The API service throws `CampaignInviteCompletionFailureError`; controllers map
that to `HttpError` before the global error handler serializes the response.
The dashboard resolves `details.kind` for review-step eligibility alerts,
step-rail build issues, and invite terminal states.

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

| Method | Path                                                        | Auth                  |
| ------ | ----------------------------------------------------------- | --------------------- |
| POST   | `/api/campaigns/:campaignId/invites`                        | owner/co-owner        |
| GET    | `/api/campaigns/:campaignId/invites`                        | owner/co-owner        |
| POST   | `/api/campaigns/:campaignId/invites/:inviteId/share-link`   | owner/co-owner        |
| POST   | `/api/campaigns/:campaignId/invites/:inviteId/revoke`       | owner/co-owner        |
| GET    | `/api/campaign-invites/:token`                              | public                |
| POST   | `/api/campaign-invites/:token/accept`                       | authenticated invitee |
| GET    | `/api/campaign-invites/by-id/:inviteId`                     | authenticated invitee |
| POST   | `/api/campaign-invites/by-id/:inviteId/accept`              | authenticated invitee |
| GET    | `/api/campaigns/:campaignId/onboarding-context`             | authenticated member  |
| GET    | `/api/campaigns/:campaignId/onboarding/eligible-characters` | authenticated member  |
| POST   | `/api/campaigns/:campaignId/onboarding/complete`            | authenticated member  |

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
